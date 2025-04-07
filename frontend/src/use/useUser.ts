import { postSelectedCompanies, fetchSelectedCompanies } from '@/api/userApi'
import { ref, Ref } from 'vue'
import { CompanyToSurveyMap, Company } from '@/../../server/src/types/api'
import useToast from '@/use/useToast'
import { useI18n } from 'vue-i18n'

const { addToast } = useToast()

const selectedCompaniesList: Ref<Company[]> = ref<Company[]>([])
const isLoadingSelectedCompanies = ref(false)
const isLoadingSaveSelectedCompanies = ref(false)

interface CompaniesListResult {
  data: Company[]
}

export const useUser = () => {
  const { t } = useI18n()

  const getSelectedCompanies = async (): CompanyToSurveyMap | Partial<CompanyToSurveyMap> => {
    isLoadingSelectedCompanies.value = true
    try {
      const result: CompaniesListResult = await fetchSelectedCompanies()
      selectedCompaniesList.value = result.data
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
    getSelectedCompanies,
    saveRelevantCompanies,
    selectedCompaniesList,
    isLoadingSaveSelectedCompanies,
    isLoadingSelectedCompanies,
  }
}
