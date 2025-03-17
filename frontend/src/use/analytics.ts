import { fetchVisitorData } from '@/api/analyticsApi'
import type { VisitorResult, DateRange } from '@/types/api'

export const useAnalytics = () => {
  const getVisitorData = async (range: DateRange) => {
    const result: VisitorResult = await fetchVisitorData(range)
    return result.data
  }

  return {
    getVisitorData,
  }
}
