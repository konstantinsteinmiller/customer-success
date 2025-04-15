import cron from 'node-cron'
import { getProcessData } from '@/controllers/process-data.controller'
import { cache, cacheKeySurveyMetrics } from '@/utils/cache'
import { logger } from '@/utils/logger'
import { SurveyMetricsService } from '@/services/survey-metrics.service'

const surveyMetricsService = new SurveyMetricsService()

async function fetchProcessData() {
  try {
    cache.del([cacheKeySurveyMetrics]) // Clear the cache before fetching new data
    await surveyMetricsService.saveSurveyMetrics(null)
    await getProcessData({} as any, { status: (statusCode: number) => ({ json: data => {} }) } as any, () => {}) // Call the function to fetch data
  } catch (error: any) {
    logger.error('Error fetching data from API:', error.message)
  }
}

// Run every minute for testing
// cron.schedule('* * * * *', () => {
//   logger.info('Running cron job every minute')
//   fetchProcessData()
// })

// Run every night at 01:00 am
cron.schedule('0 1 * * *', () => {
  logger.info('Running nightly cron job at 01:00 am')
  fetchProcessData()
})

logger.info('Cron jobs scheduled.')
