import { SurveyMetricsDocument, SurveyMetricsModel } from '@/models/survey-metrics.model'
import { CompanyToSurveyMap, SurveyMetrics } from '@/types/api'

export class SurveyMetricsRepository {
  async saveOrUpdateSurveyMetrics(data: CompanyToSurveyMap): Promise<void> {
    await SurveyMetricsModel.findOneAndUpdate(
      { index: 'index' },
      {
        $set: { lastUpdated: new Date(), surveysMap: data }, // Update the lastUpdated field
      },
      { upsert: true }
    )
  }

  async getSurveyMetrics(): Promise<CompanyToSurveyMap | null> {
    const doc: SurveyMetricsDocument | null = await SurveyMetricsModel.findOne({ index: 'index' })
    return doc ? doc.toObject().surveysMap : null
  }
}
