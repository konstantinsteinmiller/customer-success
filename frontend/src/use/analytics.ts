import { fetchVisitorData, fetchProcessData } from '@/api/analyticsApi'
import type { VisitorResult, DateRange, ProcessResult } from '@/types/api'

export const useAnalytics = () => {
  const getVisitorData = async (range: DateRange) => {
    const result: VisitorResult = await fetchVisitorData(range)
    return result.data
  }
  const getProcessData = async (companyId: string) => {
    const result: ProcessResult = await fetchProcessData(companyId)
    return result.data
  }

  return {
    getVisitorData,
    getProcessData,
  }
}
