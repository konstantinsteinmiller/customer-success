import { DASHBOARD_KPI_SORTING_ORDER } from '../config/constants'

export interface RelevantSurveyMetrics {
  totalSurveys: number
  totalCompanies: number
  avgQuestionsPerTeam: number
  participants: number
  participationRate: number // A decimal value between 0 and 1
  totalFeedForwards: number
  avgFeedForwardsPerQuestion: number
  avgFeedForwardsPerSurvey: number
  feedForwardsPerRespondentPerQuestion: number // A decimal value between 0 and 1
  transparencyRate: number // A decimal value between 0 and 1
  feedForwardHandlingRate: number // A decimal value between 0 and 1
  percentageOfFeedforwardsThatWereMarkedDiscussed: number
  tasksCreatedFromFeedForwards: number
  closingRatePerSurvey: number // A decimal value between 0 and 1
  delegationRate: number // A decimal value between 0 and 1
}

export type SurveyKPI = (typeof DASHBOARD_KPI_SORTING_ORDER)[number]
