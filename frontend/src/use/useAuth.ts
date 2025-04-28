import { fetchGoogleAccessToken, logoutUser, verifyToken } from '@/api/authApi'
import axios from 'axios'
import { googleSdkLoaded } from 'vue3-google-login'
import { useAuthStore } from '@/stores/authStore'
import { LogoutResult, VerifyTokenResult } from '@/types/api'
import { useUser } from './useUser'

let accessToken: string | null = null
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export const useAuth = () => {
  const setAccessToken = (token: string) => {
    localStorage.setItem('access_token', token)
    accessToken = token
    axios.defaults.headers.Authorization = accessToken
  }

  const loadAccessToken = () => {
    accessToken = localStorage.getItem('access_token') || null
  }

  const getAccessToken = () => {
    accessToken = accessToken || localStorage.getItem('access_token') || null
    return accessToken
  }

  const isAuthenticated = async () => {
    try {
      const { isValid }: VerifyTokenResult = await verifyToken()
      return isValid
    } catch (error: unknown) {
      console.error('error: ', error)
      return false
    }
  }

  const logout = async () => {
    const result: LogoutResult = await logoutUser()
    if (result.success) {
      accessToken = null
    }
    return result.success
  }

  const loginWithGoogle = () => {
    googleSdkLoaded(google => {
      google.accounts.oauth2
        .initCodeClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile',
          callback: async response => {
            if (response.code) {
              const result = await fetchGoogleAccessToken(response.code)
              if (!result) {
                return
              }
              const { user, accessToken } = result
              setAccessToken(accessToken)

              const authStore = useAuthStore()
              authStore.setIsAuthenticated(true)
            }
          },
        })
        .requestCode()
    })
  }

  return {
    setAccessToken,
    loadAccessToken,
    getAccessToken,
    isAuthenticated,
    logout,
    loginWithGoogle,
  }
}
