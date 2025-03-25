import mongoose, { Schema, Document } from 'mongoose'
import { Company } from '@/types/api'

export interface CompaniesDocument extends Document {
  companies: string
  lastUpdated: Date
  companiesList: Company[]
}

const CompaniesSchema: Schema = new Schema({
  companies: { type: String, required: true, unique: true },
  lastUpdated: { type: Date, default: Date.now },
  companiesList: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
    },
  ],
})

const CompaniesModel = mongoose.model<CompaniesDocument>('Companies', CompaniesSchema)

export { CompaniesModel }
export default CompaniesModel
