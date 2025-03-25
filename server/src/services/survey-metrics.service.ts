import { SurveyMetricsRepository } from '@/repositories/survey-metrics.repository'

export class SurveyMetricsService {
  private surveyMetricRepository = new SurveyMetricsRepository()

  async saveSurveyMetrics(data: any) {
    return this.surveyMetricRepository.saveOrUpdateSurveyMetrics(data)
  }

  async getSurveyMetrics() {
    return this.surveyMetricRepository.getSurveyMetrics()
  }
}
