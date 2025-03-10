import axios from 'axios'

export const verifyToken = async () => {
  try {
    const response = await axios.post('/auth/token/verify')

    return response.data
  } catch (error) {
    return error.response.data
  }
}

export const logoutUser = async () => {
  try {
    const response = await axios.post('/auth/logout')

    return response.data
  } catch (error) {
    console.error('error.response.data: ', error.response.data)
    return false
  }
}

export const fetchGoogleAccessToken = async (code: string) => {
  try {
    const response = await axios.post('http://localhost:3005/api/auth', { code })
    return response.data
  } catch (error) {
    console.error('Failed to send authorization code:', error)
    return null
  }
}
