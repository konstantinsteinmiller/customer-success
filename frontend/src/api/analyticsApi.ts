import axios from 'axios'
import { DateRange } from '../types/api'
import { Company } from '@/../../server/src/types/api'

export const fetchVisitorData = async (range: DateRange) => {
  try {
    const response = await axios.get('/analytics/visitor-data', {
      params: {
        start: range.start,
        end: range.end,
      },
    })
    return response.data
  } catch (error: unknown) {
    console.error('Unable to fetch visitor data:', error)
    return null
  }
}

export const fetchProcessData = async (companyId: string) => {
  try {
    const response = await axios.get('/process-data', {
      params: { companyId },
    })
    return response.data
  } catch (error: unknown) {
    console.error('Unable to fetch process data:', error)
    return null
  }
}
