import { VisitorsRepository } from '@/repositories/visitors.repository'
import { VisitorsList } from '@/types/api'

export class VisitorsService {
  private visitorsRepository = new VisitorsRepository()

  async saveVisitors(date: string, data: VisitorsList) {
    return this.visitorsRepository.saveOrUpdateVisitors(date, data)
  }

  async getVisitors(date: string): Promise<VisitorsList> {
    return this.visitorsRepository.getVisitors(date)
  }
}
