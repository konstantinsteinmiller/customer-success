<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import useToast, { type Toast } from '@/use/useToast'
import { VIcon } from 'vuetify/components'

const { toasts, pauseToast, resumeToast, removeToast } = useToast()

onMounted(() => {
  const updateProgress = () => {
    toasts.value.forEach((toast: Toast) => {
      if (toast.lifespan && !toast.paused) {
        const elapsed = Date.now() - toast.timestamp
        toast.progress = Math.max(0, 100 - (elapsed / toast.lifespan) * 100)
        if (elapsed >= toast.lifespan) {
          removeToast(toast.id)
        }
      }
    })
  }

  const interval = setInterval(updateProgress, 16)

  onUnmounted(() => {
    clearInterval(interval)
  })
})

const progressBarStyle = computed(() => (toast: Toast) => ({
  width: `${toast.progress}%`,
  transition: 'width 16ms linear',
}))
</script>

<template>
  <div class="fixed top-16 right-2 z-50 space-y-2 flex flex-col gap-1">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="rounded-[2px] shadow-md max-w-72 transition duration-300 ease-out relative"
      :class="{
        'transform-translate-y-8 opacity-0': toast.progress === 100,
        'transform-translate-y-0 opacity-100': toast.progress > 0 && toast.progress < 100,
        'transform-translate-x-56 opacity-0': toast.progress < 300,
        'border-l-4 border-green-900 bg-green-700': toast.type === 'success',
        'border-l-4 border-red-900  bg-red-700': toast.type === 'error',
        'border-l-4 border-yellow-600 bg-yellow-500': toast.type === 'warning',
        'border-l-4 border-blue-800 bg-blue-600': toast.type === 'info',
      }"
      @mouseover="pauseToast(toast.id)"
      @mouseleave="resumeToast(toast.id)"
    >
      <div class="absolute top-2 right-2 p-1 cursor-pointer">
        <v-icon
          size="small"
          color="white"
          @click.stop="removeToast(toast.id)"
        >
          mdi-close
        </v-icon>
      </div>
      <p class="text-sm px-3 py-2 text-white text-[1.25rem]">{{ toast.message }}</p>
      <div class="h-1">
        <div
          class="h-1 bg-white"
          :style="progressBarStyle(toast)"
        ></div>
      </div>
    </div>
  </div>
</template>
