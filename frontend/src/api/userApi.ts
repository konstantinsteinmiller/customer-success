import axios from 'axios'
import { Company } from '@/../../server/src/types/api'

export const fetchSelectedCompanies = async () => {
  try {
    const response = await axios.get('/users/companies', {})
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
