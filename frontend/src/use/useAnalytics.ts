import { fetchVisitorData, fetchProcessData } from '@/api/analyticsApi'
import type { VisitorResult, DateRange, ProcessResult } from '@/types/api'
import { computed, ComputedRef, ref, Ref } from 'vue'
import { CompanyToSurveyMap, Company } from '@/../../server/src/types/api'

const visitorsDataList: Ref<number[]> | Ref<Promise<number[]>> = ref([])
const companiesToSurveyMap: Ref<CompanyToSurveyMap> | Ref<Promise<CompanyToSurveyMap>> = ref({})
const companiesList: Ref<Company[]> = ref([])
const isLoadingVisitorData = ref(false)
const isLoadingProcessData = ref(false)

const isAnimatingMap: any = ref(new Map())
const areChartsAnimating: ComputedRef<boolean> = computed(() => {
  return Object.values(isAnimatingMap.value).some(chart => chart === true)
})

export const useAnalytics = () => {
  const getVisitorData = async (range: DateRange) => {
    isLoadingVisitorData.value = true
    try {
      const result: VisitorResult = await fetchVisitorData(range)
      // visitorsDataList.value = result.data
      return result.data
    } catch (error: any) {
      // visitorsDataList.value = []
      console.error('error while fetching visitor data: ', error)
      return {}
    } finally {
      isLoadingVisitorData.value = false
    }
  }

  const getProcessData = async (companyId: string): CompanyToSurveyMap | Partial<CompanyToSurveyMap> => {
    isLoadingProcessData.value = true
    try {
      const result: ProcessResult = await fetchProcessData(companyId)
      companiesToSurveyMap.value = result.data
      companiesList.value = Object.values(result.data).map((company: Company) => ({
        id: company.id,
        name: company.name,
      }))
      return result.data
    } catch (error: any) {
      companiesToSurveyMap.value = {}
      companiesList.value = []
      console.error('error while fetching process data: ', error)
      return {}
    } finally {
      isLoadingProcessData.value = false
    }
  }

  return {
    getVisitorData,
    getProcessData,
    companiesToSurveyMap,
    companiesList,
    visitorsDataList,
    isLoadingProcessData,
    isLoadingVisitorData,
    isAnimatingMap,
    areChartsAnimating,
  }
}
