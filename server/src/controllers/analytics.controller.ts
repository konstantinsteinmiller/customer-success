import { Request, Response, NextFunction } from 'express'
import { logger } from '@/utils/logger'
import axios from 'axios'
import { config } from '@/config/env'
import { PiwikAuthResult, PiwikQueryResult } from '@/types/piwik'
import { SurveyMetricsService } from '@/services/survey-metrics.service'

let tokenExpiry: number = 0
let piwikAccessToken: string = ''
const piwikBaseUrl = 'https://joineer.piwik.pro'
const http = axios.create({
  baseURL: piwikBaseUrl,
})

const isTokenValid = () => {
  return piwikAccessToken && Date.now() < tokenExpiry
}

export const getVisitorData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isTokenValid()) {
      const result: PiwikAuthResult = await http.post('/auth/token', {
        grant_type: 'client_credentials',
        client_id: config.PIWIK_CLIENT_ID,
        client_secret: config.PIWIK_SECRET,
      })
      // logger.info(result.data)
      piwikAccessToken = result.data.access_token
      http.defaults.headers.common['Authorization'] = `Bearer ${piwikAccessToken}`
      tokenExpiry = Date.now() + result.data.expires_in * 1000
    }

    const queryResult: PiwikQueryResult = await http.post('/api/analytics/v1/query', {
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
        // {
        //   column_id: 'sessions',
        // },
        // {
        //   column_id: 'page_views',
        // },
        // {
        //   column_id: 'goal_conversion_rate',
        // },
        // {
        //   column_id: 'events_per_session',
        // },
        // {
        //   column_id: 'returning_visitors_rate',
        // },
        // {
        //   column_id: 'goal_conversions',
        // },
      ],
      order_by: [[0, 'asc']],
      filters: null,
      metric_filters: null,
    })
    // logger.info(queryResult.data.data)
    /* save visitor data to db */
    // const visitorService = new VisitorService()
    // visitorService.saveVisitorData(queryResult.data.data)

    res.status(200).json({
      message: 'Here is the monthly visiting user data you asked for',
      data: queryResult.data.data.map(entry => entry[1]),
    })
  } catch (error) {
    logger.error(error)
    next(error)
  }
}
