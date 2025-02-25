import axios from 'axios'

export const configureAxios = () => {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL + '/api'
}
