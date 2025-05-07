<script setup lang="ts">
import { onMounted, Ref, ref, useTemplateRef, watch } from 'vue'
import { deepCompare } from '@/utils/functions'
import { Chart, registerables } from 'chart.js'
import Annotation from 'chartjs-plugin-annotation'

Chart.register(...registerables, Annotation)

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  customChartClass: {
    type: String,
    default: '',
  },
  data: {
    type: Object,
    required: true,
  },
  chartData: {
    type: Object,
    required: true,
  },
  chartOptions: {
    type: Object,
    required: true,
  },
  updateChart: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['updateInstance'])

const chartCanvas = ref<HTMLCanvasElement | null>(null)
const canvasTarget = useTemplateRef<HTMLCanvasElement | null>('canvasTarget')
const chartInstance: Ref<Chart | null> = ref(null)

let hasUpdatedChart = false
watch(
  () => props.data,
  async (newValue, oldValue) => {
    const hasDataChanged = deepCompare(newValue, oldValue).changed || false

    if (hasDataChanged && chartInstance.value) {
      hasUpdatedChart = false
      props.updateChart()
      recreateChart()
    }
  },
  { deep: true }
)

const recreateChart = () => {
  setTimeout(() => {
    if (hasUpdatedChart) return
    chartCanvas.value.style = 'display: none;'

    const instance = chartInstance.value
    chartInstance.value = null

    /* this is a safeguard to prevent executing destroy on an updating or
     * animating canvas context, which lead to an internal that breaks all
     * chart.js instance */
    setTimeout(() => {
      instance?.destroy()
    }, 5000)

    setTimeout(() => {
      setupChartInstance()
      hasUpdatedChart = true
    })
  }, 300)
}

const removeExistingCanvas = () => {
  if (chartCanvas.value) {
    /* remove old canvas element from dom */
    canvasTarget.value.removeChild(chartCanvas.value)
  }
}

const setupChartInstance = (ctx?: any) => {
  removeExistingCanvas()

  /* create a new canvas node that will host the chart */
  const canvas = document.createElement('canvas')
  canvas.classList = `chart-canvas ${props.customChartClass}`
  chartCanvas.value = canvas
  canvasTarget.value.appendChild(canvas)

  ctx = ctx || chartCanvas.value?.getContext('2d')
  if (!ctx) {
    console.error('ctx: ', !!ctx)
    return
  }

  chartInstance.value = new Chart(ctx, {
    type: props.type,
    data: props.chartData,
    options: props.chartOptions,
  })
  emit('updateInstance', chartInstance.value)
  chartCanvas.value = canvas
}

onMounted(() => {
  // Initial update if data is already present on mount
  props.updateChart()

  setupChartInstance()
})
</script>

<template>
  <div
    class="canvas-target h-80 relative"
    ref="canvasTarget"
  />
</template>

<style scoped lang="sass"></style>
