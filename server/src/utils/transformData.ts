import { SurveyMetrics } from '@/types/api'

export const convertSurveyData = (dataList: SurveyMetrics[]): Partial<SurveyMetrics>[] => {
  return dataList.map((survey: any) => {
    Object.keys(survey).forEach(key => {
      if (key === 'surveyNo' || key === 'endDate') return
      survey[key] = +survey[key]
    })
    return survey
  })
}
