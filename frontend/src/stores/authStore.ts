import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)

  const setIsAuthenticated = (value: boolean) => {
    isAuthenticated.value = value
  }

  return { isAuthenticated, setIsAuthenticated }
})
