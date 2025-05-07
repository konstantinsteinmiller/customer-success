import { Request, Response, NextFunction } from 'express'
import { logger } from '@/utils/logger'
import axios from 'axios'
import { PiwikAuthResult, PiwikQueryResult } from '@/types/piwik'
import { VisitorsService } from '@/services/visitors.service'
import type { VisitorsList } from '@/types/api'
import { cache, getCacheKeyVisitors } from '@/utils/cache'
import { getUTCDay, getYYYYMM } from '@/utils/date'
import MockedPiwikResult from '@/mocks/analytics-data.mock'

let tokenExpiry: number = 0
let piwikAccessToken: string = ''
const piwikBaseUrl = 'https://joineer.piwik.pro'
const http = axios.create({
  baseURL: piwikBaseUrl,
})

const isTokenValid = () => {
  return piwikAccessToken && Date.now() < tokenExpiry
}
const visitorsService = new VisitorsService()

const isVisitorDataOutdated = (visitorsList: VisitorsList) => {
  return visitorsList.length < getUTCDay()
}

export const getVisitorData = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.query.start || !req.query.end) {
    return res.status(400).json({
      message: 'Please provide a valid date range { start, end } in YYYY-MM-DD format',
      data: [],
    })
  }

  try {
    if (!isTokenValid()) {
      try {
        const result: PiwikAuthResult = await new Promise((resolve, reject) => {
          resolve({ data: { access_token: 'abcdef123' } })
        }) /*await http.post('/auth/token', {
          grant_type: 'client_credentials',
          client_id: config.PIWIK_CLIENT_ID,
          client_secret: config.PIWIK_SECRET,
        })*/
        // logger.info(result.data)
        piwikAccessToken = result.data.access_token
        http.defaults.headers.common['Authorization'] = `Bearer ${piwikAccessToken}`
        tokenExpiry = Date.now() + result.data.expires_in * 1000
      } catch (error: any) {
        logger.error(`Error reqesting PIWIK access token: ${error}`)
      }
    }

    const YYYYMMStartDate: string = getYYYYMM(req.query.start as string)
    const cacheKeyVisitors: string = getCacheKeyVisitors(YYYYMMStartDate)

    let visitorsThisMonthData: VisitorsList = []
    // first: Check the in-memory cache
    const cachedData: VisitorsList | undefined = cache.get<VisitorsList>(cacheKeyVisitors)
    if (cachedData?.length && !isVisitorDataOutdated(cachedData || [])) {
      // logger.info(`Serving from cache ${cachedData}`)
      visitorsThisMonthData = cachedData
    }

    // second: Check MongoDB for the latest data
    const dbData: VisitorsList = await visitorsService.getVisitors(YYYYMMStartDate)
    if (!cachedData?.length && dbData?.length && !isVisitorDataOutdated(dbData || [])) {
      // logger.info(`Serving from MongoDB ${dbData}`)
      cache.set(cacheKeyVisitors, dbData) // Update the cache
      visitorsThisMonthData = dbData
    }

    try {
      const queryResult: PiwikQueryResult = await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({ data: { data: MockedPiwikResult } })
        }, 100)
      }) /* await http.post('/api/analytics/v1/query', {
        date_from: req.query.start,
        date_to: req.query.end,
        website_id: 'bca2eb5e-593a-4aa5-a0da-e502ff72b6cf',
        offset: 0,
        columns: [
          {
            transformation_id: 'to_date',
            column_id: 'timestamp',
          },
          {
            column_id: 'visitors',
          },
        ],
        order_by: [[0, 'asc']],
        filters: null,
        metric_filters: null,
      })*/
      /* take only the visitors numbers, not the date from entry[0] */
      visitorsThisMonthData = queryResult.data.data.map((entry: Array<string | number>): number => entry[1] as number)
      // logger.info(queryResult.data.data)

      /* save visitor data to db */
      await visitorsService.saveVisitors(YYYYMMStartDate, visitorsThisMonthData)
      cache.set(cacheKeyVisitors, visitorsThisMonthData)
    } catch (error: any) {
      logger.error(error)
      res.status(404).json({
        message: 'There was an error while fetching the visitor data',
        data: [],
      })
    }

    // logger.info(visitorsThisMonthData)
    res.status(200).json({
      message: 'Here is the monthly visiting user data you asked for',
      data: visitorsThisMonthData,
    })
  } catch (error) {
    logger.error(error)
    next(error)
  }
}
