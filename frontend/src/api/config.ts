import axios from 'axios'
import { useAuth } from '@/use/useAuth'

const auth = useAuth()

export const configureAxios = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  axios.defaults.baseURL = baseUrl + '/api'
  axios.defaults.headers.Authorization = auth.getAccessToken() || ''
  axios.defaults.headers['Access-Control-Allow-Origin'] = location.origin
  axios.defaults.withCredentials = true
}
