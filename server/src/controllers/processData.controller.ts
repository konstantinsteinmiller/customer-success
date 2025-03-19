import { Request, Response, NextFunction } from 'express'
import { logger } from '@/utils/logger'
// import { http } from '@/config/api'
import type { ProcessDataResult, SurveyMetrics } from '@/types/api'
import processDataMock from '@/mocks/processData.mock'

import NodeCache from 'node-cache'
import { SurveyMetricsService } from '@/services/survey-metrics.service'
import { convertSurveyData } from '@/utils/transformData'

// Initialize the cache with a TTL (time-to-live) of 1 hour
const cache = new NodeCache({ stdTTL: 3600 })

const surveyMetricsService = new SurveyMetricsService()

export const getProcessData = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.query.companyId || typeof req.query.companyId !== 'string') {
    return res.status(400).json({ message: 'companyId is required in the query params' })
  }
  const companyId: string = req.query.companyId
  const cacheKey = `surveyMetrics:${companyId}`

  let surveysList: Partial<SurveyMetrics>[] = []

  // Step 1: Check the in-memory cache
  const cachedData: SurveyMetrics[] | undefined = cache.get<SurveyMetrics[]>(cacheKey)
  if (cachedData) {
    console.log('Serving from cache', cachedData)
    surveysList = cachedData
  }

  // Step 2: Check MongoDB for the latest data
  const dbData: SurveyMetrics[] | null = await surveyMetricsService.getSurveyMetrics(companyId)
  if (dbData) {
    console.log('Serving from MongoDB', dbData)
    cache.set(cacheKey, dbData) // Update the cache
    surveysList = dbData
  }

  // Step 3: Fetch data from the API
  if (!surveysList.length) {
    try {
      // const { data: result }: ProcessDataResult = await http.get(`/api/v1/info/processData/${companyId}`)
      const { data: result }: ProcessDataResult = await new Promise(resolve => {
        setTimeout(() => {
          resolve({ data: { data: processDataMock } })
        }, 200)
      })

      const processData = result.data

      /* go through all field keys and sum up the values for each key over all entry */
      surveysList = convertSurveyData(processData)
      // const summedData = transformSurveyData(processData)
      logger.info(surveysList)

      // Step 4: Save the data to MongoDB and update the cache
      await surveyMetricsService.saveSurveyMetrics(companyId, surveysList)
      cache.set(cacheKey, surveysList)
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  res.status(200).json({ message: 'Here is the process data', data: surveysList })
}
