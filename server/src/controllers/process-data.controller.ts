import { Request, Response, NextFunction } from 'express'
import { logger } from '@/utils/logger'
import { http } from '@/config/api'
import type { CompaniesListResult, CompanyToSurveyMap } from '@/types/api'
import { SurveyMetricsService } from '@/services/survey-metrics.service'
import { CompaniesService } from '@/services/companies.service'
import MockedSurveyData from '@/mocks/process-data.mock'
import MockedCompaniesList from '@/mocks/companies.mock'
import { cache, cacheKeySurveyMetrics, cacheKeyCompanies } from '@/utils/cache'

const surveyMetricsService = new SurveyMetricsService()
const companiesService = new CompaniesService()

export const getProcessData = async (req: Request, res: Response, next: NextFunction) => {
  let companyToSurveyMap: CompanyToSurveyMap | null | undefined = null

  // first: Check the in-memory cache
  const cachedData: CompanyToSurveyMap | undefined = cache.get<CompanyToSurveyMap>(cacheKeySurveyMetrics)
  console.log('cachedData: ', cachedData)
  if (cachedData) {
    // console.log('Serving from cache', cachedData)
    companyToSurveyMap = cachedData
  }

  // second: Check MongoDB for the latest data
  const dbData: CompanyToSurveyMap | null = await surveyMetricsService.getSurveyMetrics()
  console.log('dbData: ', dbData)
  if (!cachedData && dbData) {
    // console.log('Serving from MongoDB', dbData)
    cache.set(cacheKeySurveyMetrics, dbData) // Update the cache
    companyToSurveyMap = dbData
  }

  // last: fetch data from the API
  if (!companyToSurveyMap || !Object.keys(companyToSurveyMap)?.length) {
    console.log('companyToSurveyMap: ', companyToSurveyMap)
    try {
      /* fetch all companies */
      const { data: companies }: CompaniesListResult = await new Promise((resolve, reject) => {
        // const companiesList = Object.values(MockedSurveyData).map((company: any) => ({
        //   name: company.name,
        //   id: company.id,
        // }))
        // console.log('companiesList: ', companiesList)
        resolve({
          data: MockedCompaniesList,
        })
      }) /*await http.get(`companies`)*/
      if (!companies?.length) {
        return res.status(404).json({ message: 'No companies found' })
      }
      // logger.info(companies.slice(0, Math.min(3, companies.length - 1)))

      /* store companies in db and cache */
      await companiesService.saveCompanies(companies)
      cache.set(cacheKeyCompanies, companies)

      /* get all survey data per company */
      const result = await new Promise((resolve, reject) => {
        const map = MockedSurveyData /*Object.values(MockedSurveyData).reduce((acc, company: any) => {
          const comp = {
            name: company.name,
            id: company.id + `${Math.ceil(Math.random() * 1000)}`,
          }
          const companyId = company.id
          acc[comp.id] = { ...company, ...comp }
          return acc
        }, {})*/
        // console.log('map: ', map)
        setTimeout(() => {
          resolve(map)
        }, 100)
      }) /* await Promise.all(
        companies?.map(async (company: any) => {
          return http.get(`companies/${company.id}/process-data`, {
            headers: { 'Content-Type': 'application/json' },
          })
        })
      )*/
      companyToSurveyMap = result

      /* map from a company id to a company name with all it's surveys */
      // companyToSurveyMap = result?.reduce((acc, res, index) => {
      //   const companyId = companies[index]?.id
      //   acc[companyId] = { name: companies[index]?.name, id: companyId, surveysList: res.data }
      //   return acc
      // }, {})

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
