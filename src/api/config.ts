import axios from 'axios'
import { useAuth } from '@/use/auth.ts'

const auth = useAuth()

export const configureAxios = () => {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL + '/api'
  axios.defaults.headers.Authorization = auth.getAccessToken() || ''
}
