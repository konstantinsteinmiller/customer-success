import axios from 'axios'
import { config } from '@/config/env'

export const http = axios.create({
  baseURL: config.BACKEND_URL,
  headers: {
    'X-API-KEY': `${config.DASHBOARD_API_KEY}`,
  },
})
