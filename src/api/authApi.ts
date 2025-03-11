import axios from 'axios'

export const verifyToken = async () => {
  try {
    const response = await axios.post('/auth/token/verify')

    return response.data
  } catch (error: unknown) {
    console.error('error: ', error)
    return false
  }
}

export const logoutUser = async () => {
  try {
    const response = await axios.post('/auth/logout')

    return response.data
  } catch (error: unknown) {
    console.error('error: ', error)
    return false
  }
}

export const fetchGoogleAccessToken = async (code: string) => {
  try {
    const response = await axios.post('/auth', { code })
    return response.data
  } catch (error: unknown) {
    console.error('Failed to send authorization code:', error)
    return null
  }
}
