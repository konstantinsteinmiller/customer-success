import axios from 'axios'
import { DateRange } from '../types/api'

export const fetchVisitorData = async (range: DateRange) => {
  try {
    const response = await axios.get('/analytics/fetch-visitor-data', {
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
