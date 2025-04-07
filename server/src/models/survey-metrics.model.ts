import mongoose, { Schema, Document } from 'mongoose'
import { SurveyMetrics } from '@/types/api'

export interface SurveyMetricsDocument extends Document {
  index: string
  lastUpdated: Date
  surveysMap: { [id: string]: { name: string; id: string; surveysList: SurveyMetrics[] } }
}

const SurveyMetricsEntrySchema = new Schema(
  {
    name: { type: String, required: true },
    id: { type: String, required: true },
    surveysList: [
      {
        surveyNo: { type: Number, required: true },
        endDate: { type: String, required: true },
        participants: { type: Number, required: true },
        respondents: { type: Number, required: true },
        totalFeedForwards: { type: Number, required: true },
        totalAnonFeedForwards: { type: Number, required: true },
        transparencyRate: { type: Number, required: true },
        totalTasksClosed: { type: Number, required: true },
        totalTasksDelegated: { type: Number, required: true },
        totalTasksCreated: { type: Number, required: true },
        tasksCreatedFromFeedForwards: { type: Number, required: true },
        feedForwardsMarkedDiscussed: { type: Number, required: true },
        feedForwardsPerRespondentPerQuestion: { type: Number, required: true },
        activeFeedForwardsPerUser: { type: Number, required: true },
        feedForwardsPerQuestion: { type: Number, required: true },
        avgQuestionsPerTeam: { type: Number, required: true },
        participationRate: { type: Number, required: true },
        delegationRate: { type: Number, required: true },
        feedForwardHandlingRate: { type: Number, required: true },
        closingRatePerSurvey: { type: Number, required: true },
      },
    ],
  },
  { _id: false }
)

const SurveyMetricsSchema: Schema = new Schema({
  index: { type: String, required: true, unique: true },
  lastUpdated: { type: Date, default: Date.now },
  surveysMap: {
    type: Object,
    of: SurveyMetricsEntrySchema,
  },
})

const SurveyMetricsModel = mongoose.model<SurveyMetricsDocument>('SurveyMetrics', SurveyMetricsSchema)

export { SurveyMetricsModel }
export default SurveyMetricsModel
