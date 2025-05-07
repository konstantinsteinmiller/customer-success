import axios from 'axios'
import { Company } from '@/../../server/src/types/api'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
export const fetchUser = async () => {
  try {
    const response = await axios.get('/user', {
      headers: {
        'Access-Control-Allow-Origin': location.origin,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
    return response.data
  } catch (error: unknown) {
    console.error('Unable to fetch selected companies:', error)
    return null
  }
}

export const postSelectedCompanies = async (selectedCompaniesList: Company[]) => {
  try {
    const response = await axios.post('/users/companies', {
      data: selectedCompaniesList,
    })
    return response.data
  } catch (error: unknown) {
    console.error('Unable to save selected companies:', error)
    return null
  }
}
