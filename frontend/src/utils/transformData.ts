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

export function getKpiAvgPerSurvey(relevantList: RelevantSurveyMetrics[]): RelevantSurveyMetrics {
  if (!relevantList || relevantList.length === 0) {
    return []
  }

  const maxSurveys = Math.max(...relevantList.map(companySurveys => companySurveys.length))
  const averagedSurveys: SurveyMetrics[] = Array(maxSurveys)
    .fill(null)
    .map(() => ({
      avgQuestionsPerTeam: null,
      participants: null,
      participationRate: null,
      totalFeedForwards: null,
      feedForwardsPerRespondentPerQuestion: null,
      transparencyRate: null,
      feedForwardHandlingRate: null,
      tasksCreatedFromFeedForwards: null,
      closingRatePerSurvey: null,
      delegationRate: null,
      percentageOfFeedforwardsThatWereMarkedDiscussed: null,
      avgFeedForwardsPerQuestion: null,
    }))

  for (let i = 0; i < maxSurveys; i++) {
    const summedValues = relevantList.reduce(
      (acc, companySurveys) => {
        const survey = companySurveys[i]
        if (survey) {
          Object.keys(acc).forEach(key => {
            if (key !== 'validCompanyCount' && typeof survey[key as keyof SurveyMetrics] === 'number') {
              acc[key as keyof Omit<typeof acc, 'validCompanyCount'>] += survey[key as keyof SurveyMetrics] as number
            }
          })
          acc.validCompanyCount++
        }
        return acc
      },
      {
        avgQuestionsPerTeam: 0,
        participants: 0,
        participationRate: 0,
        totalFeedForwards: 0,
        feedForwardsPerRespondentPerQuestion: 0,
        transparencyRate: 0,
        feedForwardHandlingRate: 0,
        tasksCreatedFromFeedForwards: 0,
        closingRatePerSurvey: 0,
        delegationRate: 0,
        percentageOfFeedforwardsThatWereMarkedDiscussed: 0,
        avgFeedForwardsPerQuestion: 0,
        validCompanyCount: 0,
      }
    )

    if (summedValues.validCompanyCount > 0) {
      Object.keys(averagedSurveys[i]).forEach(key => {
        if (key !== 'validCompanyCount' && summedValues[key as keyof typeof summedValues] !== 0) {
          averagedSurveys[i][key as keyof SurveyMetrics] =
            summedValues[key as keyof typeof summedValues] / summedValues.validCompanyCount
        }
      })
    }
  }

  return averagedSurveys
}

interface KpiData {
  avgQuestionsPerTeam: number
  participants: number
  participationRate: number
  totalFeedForwards: number
  feedForwardsPerRespondentPerQuestion: number
  transparencyRate: number
  feedForwardHandlingRate: number
  tasksCreatedFromFeedForwards: number
  closingRatePerSurvey: number
  delegationRate: number
  percentageOfFeedforwardsThatWereMarkedDiscussed: number
  avgFeedForwardsPerQuestion: number
  [key: string]: number | undefined
}
interface KpiStandardDeviations {
  [key: string]: {
    stdDev: number | null
    upperBound: number | null
    lowerBound: number | null
    mean: number | null
  }
}

export const calculateKpiStandardDeviations = (dataList: KpiData[]): KpiStandardDeviations => {
  const calculateStandardDeviation = (data: number[]): number | null => {
    if (data.length <= 1) {
      return null
    }
    const mean = data.reduce((sum, value) => sum + value, 0) / data.length
    const squaredDifferences = data.map(value => (value - mean) ** 2)
    const variance = squaredDifferences.reduce((sum, value) => sum + value, 0) / (data.length - 1)
    return Math.sqrt(variance)
  }

  if (!dataList || dataList.length === 0) {
    return {}
  }

  const kpiKeys = Object.keys(dataList[0]).filter(key => typeof dataList[0][key] === 'number')

  const kpiStandardDeviations: KpiStandardDeviations = {}

  kpiKeys.forEach(kpiKey => {
    const kpiValues = dataList.map(entry => entry[kpiKey]).filter((value): value is number => typeof value === 'number')

    const stdDev = calculateStandardDeviation(kpiValues)
    let mean: number | null = null
    let upperBound: number | null = null
    let lowerBound: number | null = null

    if (stdDev !== null && kpiValues.length > 0) {
      mean = kpiValues.reduce((sum, value) => sum + value, 0) / kpiValues.length
      upperBound = mean + stdDev
      lowerBound = mean - stdDev
    }

    kpiStandardDeviations[kpiKey] = { stdDev, upperBound, lowerBound, mean }
  })

  return kpiStandardDeviations
}
