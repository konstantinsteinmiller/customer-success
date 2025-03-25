import { CompaniesRepository } from '@/repositories/companies.repository'
import { Company } from '@/types/api'

export class CompaniesService {
  private companiesRepository = new CompaniesRepository()

  async saveCompanies(data: Company[]) {
    return this.companiesRepository.saveOrUpdateCompanies(data)
  }

  async getCompanies(companies: string) {
    return this.companiesRepository.getCompanies(companies)
  }
}
