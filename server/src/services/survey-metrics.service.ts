import { SurveyMetricsRepository } from '@/repositories/surver-metrics.repository'

export class SurveyMetricsService {
  private surveyMetricRepository = new SurveyMetricsRepository()

  async saveSurveyMetrics(companyId: string, data: any) {
    // const existingSurveyMetric = await this.surveyMetricRepository.findByCompanyId(companyId)
    // if (existingSurveyMetric) {
    //   throw new Error('Survey metric already exists')
    // }

    return this.surveyMetricRepository.saveOrUpdateSurveyMetrics(companyId, data)
  }

  async getSurveyMetrics(companyId) {
    return this.surveyMetricRepository.getSurveyMetrics(companyId)
  }
}
