import { postSelectedCompanies, fetchUser } from '@/api/userApi'
import { computed, ComputedRef, ref, Ref, watch } from 'vue'
import { CompanyToSurveyMap, Company } from '@/../../server/src/types/api'
import useToast from '@/use/useToast'
import { useI18n } from 'vue-i18n'
import { useAnalytics } from './useAnalytics'

const { addToast } = useToast()

const selectedCompaniesList: Ref<Company[]> = ref<Company[]>([])
const isLoadingSelectedCompanies = ref(false)
const isLoadingSaveSelectedCompanies = ref(false)
const userProfile: Ref<any> = ref({})

interface CompaniesListResult {
  data: Company[]
}

export const useUser = () => {
  const { t } = useI18n()
  const { companiesList } = useAnalytics()

  /* select the first entry so the company selector is filled with a company */
  watch(
    () => companiesList.value,
    () => {
      selectedCompany.value = selectedCompaniesRef.value[0]
    },
    { once: true }
  )
  const selectedCompany: Ref<Company | object> = ref({ name: t('loading'), id: 'loading' })

  const selectedCompaniesRef = computed(() => {
    /* if there is a user selection of companies, return the companies */
    return selectedCompaniesList.value.length
      ? selectedCompaniesList.value.map(c => ({ id: c.id, name: c.name }))
      : companiesList.value
  })

  const totalCompanies: ComputedRef<number | undefined> = computed(() => {
    return selectedCompaniesRef.value?.length
  })

  const getUser = async (): CompanyToSurveyMap | Partial<CompanyToSurveyMap> => {
    isLoadingSelectedCompanies.value = true
    try {
      const result: {
        data: {
          id: string
          name: string
          picture: string
          companiesList: Company[]
        }
      } = await fetchUser()

      selectedCompaniesList.value = result?.data?.companiesList
      userProfile.value = result?.data

      return result.data
    } catch (error: any) {
      selectedCompaniesList.value = []
      console.error('error while fetching selected companies: ', error)
      return {}
    } finally {
      isLoadingSelectedCompanies.value = false
    }
  }

  const saveRelevantCompanies = async (selectedCompaniesList: Company[]): Promise<Company[]> => {
    isLoadingSaveSelectedCompanies.value = true
    try {
      const result: any = await postSelectedCompanies(selectedCompaniesList)
      getUser()
      addToast(t('useUser.success.saveSelectedCompanies'), 'success')
      return result.data
    } catch (error: any) {
      const errorMessage = t('useUser.success.saveSelectedCompanies')
      addToast(errorMessage, 'error')
      console.error(errorMessage, error)
      return {}
    } finally {
      isLoadingSaveSelectedCompanies.value = false
    }
  }

  return {
    getUser,
    saveRelevantCompanies,
    selectedCompaniesList,
    isLoadingSaveSelectedCompanies,
    isLoadingSelectedCompanies,
    selectedCompaniesRef,
    selectedCompany,
    totalCompanies,
    userProfile,
  }
}
