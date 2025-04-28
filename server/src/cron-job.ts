import cron from 'node-cron'
import { getProcessData } from '@/controllers/process-data.controller'
import { cache, cacheKeyCompanies, cacheKeySurveyMetrics } from '@/utils/cache'
import { logger } from '@/utils/logger'
import { SurveyMetricsService } from '@/services/survey-metrics.service'
import { getVisitorData } from '@/controllers/analytics.controller'
import { CompaniesService } from '@/services/companies.service'
import { VisitorsService } from '@/services/visitors.service'
import { getCurrentMonthDateRange } from '@/utils/date'

const surveyMetricsService = new SurveyMetricsService()
const visitorsService = new VisitorsService()
const companiesService = new CompaniesService()

async function fetchProcessData() {
  try {
    cache.del([cacheKeySurveyMetrics]) // Clear the cache before fetching new data
    cache.del([cacheKeyCompanies])
    await surveyMetricsService.saveSurveyMetrics(null) // Clear the visitors data in the database
    await companiesService.saveCompanies([]) // Clear the visitors data in the database
    await getProcessData({} as any, { status: () => ({ json: () => {} }) } as any, () => {}) // Call the function to fetch data
  } catch (error: any) {
    logger.error('Error fetching data from API:', error.message)
  }
}

async function fetchVisitors() {
  try {
    const { start, end } = getCurrentMonthDateRange()
    await visitorsService.saveVisitors(start, []) // Clear the visitors data in the database
    await getVisitorData({ query: { start, end } } as any, { status: () => ({ json: () => {} }) } as any, () => {}) // Call the function to fetch data
  } catch (error: any) {
    logger.error('Error fetching visitors data from PIWIK API:', error)
  }
}

// Run every minute for testing
// cron.schedule('* * * * *', () => {
//   logger.info('Running cron job every minute')
//   fetchVisitors()
//   fetchProcessData()
// })

// Run every night at 01:00 am
cron.schedule('0 1 * * *', () => {
  logger.info('Running nightly cron job at 01:00 am')
  fetchVisitors()
  fetchProcessData()
})

logger.info('Cron jobs scheduled.')
