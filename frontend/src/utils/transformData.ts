import { SurveyMetrics } from '@/../../server/src/types/api'
import { RelevantSurveyMetrics } from '@/types/SurveyMetrics'

export const transformSurveyData = (dataList: SurveyMetrics[]): RelevantSurveyMetrics => {
  const totalEntries = dataList.length
  return dataList.reduce((acc, curr, index) => {
    Object.keys(curr).forEach(key => {
      if (key === 'surveyNo' || key === 'endDate' || key === '_id') return
      const value = +curr[key]

      if (!acc[key]) acc[key] = 0
      acc[key] += value
    })

    /* average them out */
    if (index === totalEntries - 1) {
      Object.keys(acc).forEach(key => {
        if (key === 'totalFeedForwards') {
          acc['avgFeedForwardsPerSurvey'] = +(acc[key] / totalEntries).toFixed(2)
          acc['totalFeedForwards'] = +acc[key].toFixed(2)
        }
        acc[key] = +(acc[key] / totalEntries).toFixed(2)
      })
    }
    return acc
  }, {})
}

export function getAllRelevantCompaniesAvgKPIs(relevantList: RelevantSurveyMetrics[]): RelevantSurveyMetrics {
  /* filter out all companies that have no surveys */
  const cleanedRelevantCompaniesList = relevantList.filter(company => company.totalCompanies >= 0)

  const totalCompanies = cleanedRelevantCompaniesList.length || 1 /* to avoid division by 0 */

  /* now sum over all companies and surveys to create reference value for each metric */
  return cleanedRelevantCompaniesList.reduce(
    (acc: Partial<RelevantSurveyMetrics>, curr: RelevantSurveyMetrics, index: number) => {
      for (const key in curr) {
        /* sum up each key of each company */
        const value = curr[key]
        if (key in acc) {
          acc[key] += value
        } else {
          acc[key] = value
        }

        /* on last item, generate avg for each key */
        if (index === totalCompanies - 1) {
          if (acc[key] === undefined) {
            acc[key] = 0
          }
          acc[key] = +(acc[key] / totalCompanies).toFixed(2)
        }
      }
      return acc
    },
    {}
  )
}
