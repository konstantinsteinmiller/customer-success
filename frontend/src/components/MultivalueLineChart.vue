<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, Ref } from 'vue'
import { Chart, Tooltip, LineController, LineElement, PointElement, LinearScale, CategoryScale, Legend } from 'chart.js'
import Annotation from 'chartjs-plugin-annotation'
import { CHART_COLORS } from '@/config/constants'
import { useI18n } from 'vue-i18n'
import { deepCompare } from '@/utils/functions'
import { isKpiPercentValue } from '@/utils/analytics'

Chart.register(LineController, Tooltip, LineElement, PointElement, LinearScale, CategoryScale, Legend, Annotation)

const { t } = useI18n()
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  data: {
    type: Object,
    default: () => ({}),
  },
  id: {
    type: String,
    required: true,
  },
  labels: {
    type: Array,
    default: () => [],
  },
  color: {
    type: String,
    default: CHART_COLORS.blue,
  },
  backgroundColor: {
    type: String,
    default: 'rgba(75, 192, 192, 0.2)',
  },
})

const chartCanvas = ref(null)
const chartInstance: Ref<Chart | null> = ref(null)
const isAnimating = ref(false) // Ref to track animation state

const chartData = {
  labels: props.labels,
  datasets: [
    {
      label: t('current'),
      backgroundColor: props.backgroundColor,
      borderColor: props.color,
      borderWidth: 2,
      data: [], // Will be populated from data
      tension: 0.3,
    },
    {
      label: t('avgCompanies'),
      backgroundColor: `rgba(255, 161, 161, 0.66)`,
      borderColor: CHART_COLORS.red,
      borderWidth: 2,
      data: [], // Will be populated from data
      tension: 0.3,
    },
  ],
}

const annotation1 = {
  type: 'line',
  borderColor: 'rgb(100, 149, 237)',
  borderDash: [6, 6],
  borderDashOffset: 0,
  borderWidth: 3,
  label: {
    display: true,
    backgroundColor: 'rgb(100, 149, 237)',
    content: ctx => 'Average: ' + props.data.mean.toFixed(2),
  },
  scaleID: 'y',
  value: ctx => props.data.mean,
}
// const annotation2 = {
//   type: 'line',
//   borderColor: 'rgba(102, 102, 102, 0.5)',
//   borderDash: [6, 6],
//   borderDashOffset: 0,
//   borderWidth: 3,
//   label: {
//     display: true,
//     backgroundColor: 'rgba(102, 102, 102, 0.5)',
//     color: 'black',
//     content: ctx => (average(ctx) + standardDeviation(ctx)).toFixed(2),
//     position: 'start',
//     rotation: -90,
//     yAdjust: -28,
//   },
//   scaleID: 'y',
//   value: ctx => average(ctx) + standardDeviation(ctx),
// }
// const annotation3 = {
//   type: 'line',
//   borderColor: 'rgba(102, 102, 102, 0.5)',
//   borderDash: [6, 6],
//   borderDashOffset: 0,
//   borderWidth: 3,
//   label: {
//     display: true,
//     backgroundColor: 'rgba(102, 102, 102, 0.5)',
//     color: 'black',
//     content: ctx => (average(ctx) - standardDeviation(ctx)).toFixed(2),
//     position: 'end',
//     rotation: 90,
//     yAdjust: 28,
//   },
//   scaleID: 'y',
//   value: ctx => average(ctx) - standardDeviation(ctx),
// }

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      grace: '10%',
      title: {
        display: true,
        text: props.title,
      },
    },
  },
  interaction: {
    mode: 'nearest',
    intersect: false,
  },
  plugins: {
    annotation: {
      annotations: props.data?.stdDev && [
        {
          type: 'box',
          yMin: +props.data.stdDev.lowerBound.toFixed(2),
          yMax: +props.data.stdDev.upperBound.toFixed(2),
          borderColor: 'rgba(255, 201, 14, 0.7)',
          backgroundColor: 'rgba(255, 201, 14, 0.1)',
          borderWidth: 2,
          label: {
            content: `±${+props.data.stdDev.stdDev.toFixed(2)} Std Dev`,
            display: true,
            position: 'top',
            font: {
              size: 12,
              color: 'rgba(255, 201, 14, 1)',
            },
          },
        },
      ],
      // annotations: {
      //   annotation1,
      //   // annotation2,
      //   // annotation3,
      // },
    },
    tooltip: {
      enabled: true,
      mode: 'index',
      intersect: false,
      callbacks: {
        label: context => {
          const label = context.dataset.label || ''
          const value = context.raw /*+context.raw?.toFixed(2)*/
          return `${label}: ${value}${isKpiPercentValue(props.id) ? '%' : ''}`
        },
      },
    },
  },
  legend: {
    display: true,
    position: 'top',
    labels: {
      color: 'black',
      font: {
        size: 14,
      },
    },
  },
  animation: {
    onProgress: () => {
      isAnimating.value = true
    },
    onComplete: () => {
      isAnimating.value = false
    },
  },
}

const updateChart = () => {
  if (!props.data) return

  const data = props.data
  chartData.labels = props.labels
  chartData.datasets[0].data = data?.current || []
  chartData.datasets[1].data = data?.companiesAvg || []
}

watch(
  () => props.data,
  async (newValue, oldValue) => {
    const hasDataChanged = deepCompare(newValue, oldValue).changed || false

    await new Promise(resolve => {
      if (isAnimating.value) {
        setTimeout(() => {
          resolve(true)
        }, 1000)
      } else {
        resolve(false)
      }
    })
    if (hasDataChanged && chartInstance.value) {
      updateChart()

      try {
        /* fix weird animation and chart destroy race condition
         * wait for the animation to finish before continuing to
         * destroy the chart to prevent chart.js error that breaks rendering */
        await new Promise(resolve => {
          if (isAnimating.value) {
            const interval = setInterval(() => {
              if (!isAnimating.value) {
                clearInterval(interval)
                resolve(true)
              }
            }, 300)
          } else resolve(true)
        })

        chartInstance.value.destroy()
        chartInstance.value = new Chart(chartCanvas.value?.getContext('2d'), {
          type: 'line',
          data: chartData,
          options: chartOptions,
        })
      } catch (e) {
        console.error('Error creating chart:', e)
      }
    }
  },
  { deep: true }
)

onMounted(() => {
  const ctx = chartCanvas.value?.getContext('2d')

  // Initial update if data is already present on mount
  updateChart()

  if (ctx) {
    chartInstance.value = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: chartOptions,
    })
  }
})

onUnmounted(() => chartInstance.value?.destroy())
</script>

<template>
  <div class="h-64">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<i18n>
en:
  avgCompanies: 'Avg. Companies'
  current: 'Selected Company'
de:
  avgCompanies: 'Avg. Unternehmen'
  current: 'Ausgewähltes Unternehmen'
</i18n>
