import { SurveyMetricsDocument, SurveyMetricsModel } from '@/models/survey-metrics.model'
import { SurveyMetrics } from '@/types/api'

export class SurveyMetricsRepository {
  async saveOrUpdateSurveyMetrics(companyId: string, data: SurveyMetrics[]): Promise<void> {
    await SurveyMetricsModel.findOneAndUpdate(
      { companyId },
      {
        $set: { lastUpdated: new Date(), surveys: data }, // Update the lastUpdated field
      },
      { upsert: true }
    )
  }

  async findByCompanyId(companyId: string) {
    return SurveyMetricsModel.findOne({ companyId })
  }

  async getSurveyMetrics(companyId: string): Promise<SurveyMetrics[] | null> {
    const doc: SurveyMetricsDocument | null = await SurveyMetricsModel.findOne({ companyId })
    return doc ? doc.toObject().surveys : null
  }
}
