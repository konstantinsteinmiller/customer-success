import { VisitorsDocument, VisitorsModel } from '@/models/visitors.model'
import { VisitorsList } from '@/types/api'

export class VisitorsRepository {
  async saveOrUpdateVisitors(date: string, data: VisitorsList): Promise<void> {
    await VisitorsModel.findOneAndUpdate(
      { date: date },
      {
        $set: { lastUpdated: new Date(), visitorsList: data }, // Update the lastUpdated field
      },
      { upsert: true }
    )
  }

  async getVisitors(date: string): Promise<VisitorsList> {
    const doc: VisitorsDocument | null = await VisitorsModel.findOne({ date: date })
    return doc ? doc.toObject().visitorsList : []
  }
}
