import { SurveyMetrics } from '@/../../server/src/types/api'
import { RelevantSurveyMetrics } from '@/types/SurveyMetrics'
import { KPIData } from '../types/SurveyMetrics'

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

export const addCalculatedKpis = (surveyList: SurveyMetrics[]) => {
  const acc = {
    avgFeedForwardsPerSurvey: 0,
  }

  const totalEntries = surveyList.length
  surveyList.forEach((survey: SurveyMetrics, index: number) => {
    Object.keys(survey).forEach((key: string) => {
      const value = +survey[key]
      if (acc[key] === undefined) acc[key] = 0
      acc[key] += value

      if (key === 'totalFeedForwards' && index === totalEntries - 1) {
        acc['avgFeedForwardsPerSurvey'] = +(acc[key] / totalEntries).toFixed(2)
      }
    })
  })

  const enrichedSurveyList = surveyList.map((survey: SurveyMetrics) => {
    survey['avgFeedForwardsPerSurvey'] = acc['avgFeedForwardsPerSurvey']
    return survey
  })
  return enrichedSurveyList
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

class KPIStdDevResult {}

/**
 * Calculates the mean, standard deviation, and bounds (mean +/- stdDev) for each KPI
 * in the provided data.
 *
 * @param data An array of KPI data objects.
 * @returns An object containing the calculated statistics for each KPI.
 */
const standardDeviation = (data: number[]): number => {
  if (data.length <= 1) return 0

  const mean = data.reduce((a, b) => a + b, 0) / data.length
  const diffs = data.map(value => value - mean)
  const squareDiffs = diffs.map(diff => diff * diff)
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length
  return Math.sqrt(avgSquareDiff) || 0
}

/**
 * Calculates the mean, standard deviation, and bounds (mean +/- stdDev) for each KPI,
 * calculated separately for each survey ID across all companies.  Handles cases where
 * companies have different numbers of surveys.
 *
 * @param companiesListWithSurveysList An array of companies, each company containing a list of surveys with KPI data objects.
 * @returns An object containing the calculated statistics for each KPI and survey ID.
 */
export const calculateKpiStandardDeviationsPerSurvey = (companiesListWithSurveysList: KPIData[]): KPIStdDevResult => {
  /* find first company with an survey */
  companiesListWithSurveysList = companiesListWithSurveysList.filter(surveys => surveys.length)
  const referenceSurvey = companiesListWithSurveysList[0][0]
  if (!referenceSurvey) return {}

  const kpiKeys = Object.keys(referenceSurvey)?.filter(key => typeof referenceSurvey?.[key] === 'number')
  const result: KPIStdDevResult = {}

  // 1. Group data by surveyId
  const surveys: { [surveyId: number]: KPIData[] } = {}
  companiesListWithSurveysList.forEach((company: any) => {
    company.forEach((survey: KPIData, index: number) => {
      const surveyId = index + 1 // Use the surveyId from the data item
      if (!surveys[surveyId]) {
        surveys[surveyId] = []
      }
      surveys[surveyId].push(survey)
    })
  })

  // 2. Calculate statistics for each KPI and surveyId
  kpiKeys.forEach(kpi => {
    result[kpi] = {}
    Object.keys(surveys).forEach(surveyIdKey => {
      const surveyId = parseInt(surveyIdKey, 10)
      const surveyData = surveys[surveyId]
      const values = surveyData.map(item => item[kpi])
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const stdDev = standardDeviation(values)
      const lowerBound = mean - stdDev
      const upperBound = mean + stdDev
      const count = values.length

      result[kpi][surveyId] = {
        mean: +mean.toFixed(2),
        lowerBound: +lowerBound.toFixed(2),
        upperBound: +upperBound.toFixed(2),
        count: count,
      }
    })

    result[kpi] = Object.values(result[kpi])
  })

  return result
}

export const calculateKpiStandardDeviationsPerCompany = (dataList: KPIData[]): KPIStdDevResult => {
  if (!dataList.length) return {}

  const firstSurvey = dataList[0]
  const kpiKeys = Object.keys(firstSurvey).filter(key => typeof firstSurvey[key] === 'number')
  const result: KPIStdDevResult = {}

  kpiKeys.forEach(kpi => {
    const values = dataList.map((item: any) => item[kpi])
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const stdDev = standardDeviation(values)
    const lowerBound = mean - stdDev
    const upperBound = mean + stdDev

    result[kpi] = {
      mean: mean,
      lowerBound: lowerBound,
      upperBound: upperBound,
    }
  })

  return result
}

export const getStdAvgOverCompanies = (withStdDevPerSurveyList: any[]) => {
  return withStdDevPerSurveyList.reduce((acc: any, companyStds: KPIData, index: number) => {
    const kpis = Object.keys(companyStds)

    kpis.forEach((kpi: string) => {
      const kpiValue = companyStds[kpi]
      if (acc[kpi] === undefined) {
        acc[kpi] = {
          mean: 0,
          upperBound: 0,
          lowerBound: 0,
        }
      }

      Object.keys(acc[kpi]).forEach((stdKey: string) => {
        acc[kpi][stdKey] += kpiValue[stdKey]
      })
    })

    /* calc average*/
    if (index === withStdDevPerSurveyList.length - 1 && withStdDevPerSurveyList.length >= 2) {
      kpis.forEach((kpi: string) => {
        Object.keys(acc[kpi]).forEach((stdKey: string) => {
          acc[kpi][stdKey] = +(acc[kpi][stdKey] / withStdDevPerSurveyList.length).toFixed(2)
        })
      })
    }
    return acc
  }, {})
}
