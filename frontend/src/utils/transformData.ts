import { SurveyMetrics } from 'server/src/types/api'

export const transformSurveyData = (dataList: SurveyMetrics[]): Partial<SurveyMetrics> => {
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
        acc[key] = +(acc[key] / totalEntries).toFixed(2)
      })
    }
    return acc
  }, {})
}
