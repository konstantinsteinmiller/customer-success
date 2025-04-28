import mongoose, { Schema, Document } from 'mongoose'
import { VisitorsList } from '@/types/api'

export interface VisitorsDocument extends Document {
  date: string
  lastUpdated: Date
  visitorsList: VisitorsList
}

const VisitorsSchema: Schema = new Schema({
  date: { type: String, required: true, unique: true },
  lastUpdated: { type: Date, default: Date.now },
  visitorsList: { type: Array, default: [] },
})

const VisitorsModel = mongoose.model<VisitorsDocument>('Visitors', VisitorsSchema)

export { VisitorsModel }
export default VisitorsModel
