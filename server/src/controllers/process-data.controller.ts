import { Request, Response, NextFunction } from 'express'
import { logger } from '@/utils/logger'
import { http } from '@/config/api'
import type { CompaniesListResult, CompanyToSurveyMap } from '@/types/api'
import NodeCache from 'node-cache'
import { SurveyMetricsService } from '@/services/survey-metrics.service'
import { CompaniesService } from '@/services/companies.service'

// Initialize the cache with a TTL (time-to-live) of 6 hour
const cache = new NodeCache({ stdTTL: 3600 * 6 })

const surveyMetricsService = new SurveyMetricsService()
const companiesService = new CompaniesService()

export const getProcessData = async (req: Request, res: Response, next: NextFunction) => {
  const cacheKeySurveyMetrics = `surveyMetrics`
  const cacheKeyCompanies = `companies`

  let companyToSurveyMap: CompanyToSurveyMap | null | undefined = null

  // first: Check the in-memory cache
  const cachedData: CompanyToSurveyMap | undefined = cache.get<CompanyToSurveyMap>(cacheKeySurveyMetrics)
  if (cachedData) {
    // console.log('Serving from cache', cachedData)
    companyToSurveyMap = cachedData
  }

  // second: Check MongoDB for the latest data
  const dbData: CompanyToSurveyMap | null = await surveyMetricsService.getSurveyMetrics()
  if (dbData) {
    // console.log('Serving from MongoDB', dbData)
    cache.set(cacheKeySurveyMetrics, dbData) // Update the cache
    companyToSurveyMap = dbData
  }

  // last: fetch data from the API
  if (!companyToSurveyMap || !Object.keys(companyToSurveyMap)?.length) {
    try {
      /* fetch all companies */
      const { data: companies }: CompaniesListResult = await http.get(`companies`)
      if (!companies?.length) {
        return res.status(404).json({ message: 'No companies found' })
      }
      // logger.info(companies.slice(0, Math.min(3, companies.length - 1)))

      /* store companies in db and cache */
      await companiesService.saveCompanies(companies)
      cache.set(cacheKeyCompanies, companies)

      /* get all survey data per company */
      const result = await Promise.all(
        companies?.map(async (company: any) => {
          return http.get(`companies/${company.id}/process-data`, {
            headers: { 'Content-Type': 'application/json' },
          })
        })
      )

      /* map from a company id to a company name with all it's surveys */
      companyToSurveyMap = result?.reduce((acc, res, index) => {
        const companyId = companies[index]?.id
        acc[companyId] = { name: companies[index]?.name, id: companyId, surveysList: res.data }
        return acc
      }, {})

      /* only log first 5 entries */
      logger.info(
        Object.values(companyToSurveyMap).reduce((acc, res, index) => {
          if (index >= 5) return acc
          acc[res.id] = res
          return acc
        }, {})
      )

      // Step 4: Save the data to MongoDB and update the cache
      await surveyMetricsService.saveSurveyMetrics(companyToSurveyMap)
      cache.set(cacheKeySurveyMetrics, companyToSurveyMap)
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  res.status(200).json({ message: 'Here is the process data', data: companyToSurveyMap })
}
