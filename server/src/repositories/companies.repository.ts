import { CompaniesDocument, CompaniesModel } from '@/models/companies.model'
import { Company } from '@/types/api'

export class CompaniesRepository {
  async saveOrUpdateCompanies(data: Company[]): Promise<void> {
    await CompaniesModel.findOneAndUpdate(
      { companies: 'companies' },
      {
        $set: { lastUpdated: new Date(), companiesList: data }, // Update the lastUpdated field
      },
      { upsert: true }
    )
  }

  async getCompanies(companies: string): Promise<Company[] | null> {
    const doc: CompaniesDocument | null = await CompaniesModel.findOne({ companies })
    return doc ? doc.toObject().data : null
  }
}
