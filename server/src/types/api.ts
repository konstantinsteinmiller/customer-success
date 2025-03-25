export interface BackendAuthResult {
  data: {
    access_token: string
    expires_in: number
    token_type: string
  }
}

export interface SurveyMetrics {
  surveyNo: number
  endDate: string // ISO date format (e.g., 'YYYY-MM-DD')
  participants: number
  respondents: number
  totalFeedForwards: number
  totalAnonFeedForwards: number
  totalTasksClosed: number
  totalTasksDelegated: number
  totalTasksCreated: number
  tasksCreatedFromFeedForwards: number
  feedForwardsMarkedDiscussed: number
  activeFeedForwardsPerUser: number
  feedForwardsPerQuestion: number
  avgQuestionsPerTeam: number
  transparencyRate: number // A decimal value between 0 and 1
  feedForwardsPerRespondentPerQuestion: number // A decimal value between 0 and 1
  participationRate: number // A decimal value between 0 and 1
  delegationRate: number // A decimal value between 0 and 1
  feedForwardHandlingRate: number // A decimal value between 0 and 1
  closingRatePerSurvey: number // A decimal value between 0 and 1
}

export interface ProcessDataResult {
  data: SurveyMetrics[]
}

export interface Company {
  id: string
  name: string
}

export interface CompaniesListResult {
  data: Company[]
}

export interface CompanyToSurveyMap {
  [key: string]: {
    name: string
    surveysList: SurveyMetrics[]
  }
}
