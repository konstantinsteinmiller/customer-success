import { ref, Ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  lifespan?: number
  timestamp: number
  progress: number
  paused: boolean
}

const toasts: Ref<Toast[]> = ref<Toast[]>([])
let toastId = 0

export function useToast() {
  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success', lifespan = 5000) => {
    if (!message) {
      console.error('Toast message cannot be empty')
      return
    }
    const newToast: Toast = {
      id: toastId++,
      message,
      type,
      lifespan,
      timestamp: Date.now(),
      progress: 100,
      paused: false,
    }
    toasts.value.push(newToast)
  }

  const pauseToast = (id: number) => {
    const toast = toasts.value.find(toast => toast.id === id)
    if (toast) {
      toast.paused = true
    }
  }

  const resumeToast = (id: number) => {
    const toast = toasts.value.find(toast => toast.id === id)
    if (toast) {
      toast.paused = false
    }
  }

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  return {
    toasts,
    addToast,
    pauseToast,
    resumeToast,
    removeToast,
  }
}
export default useToast
