<script setup lang="ts">
import { onMounted, Ref, ref, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useI18n } from 'vue-i18n'
import { CHART_COLORS } from '@/config/constants'
import { useRoute } from 'vue-router'
import { isKpiPercentValue } from '@/utils/analytics'
import Annotation from 'chartjs-plugin-annotation'
import { deepCompare } from '@/utils/functions'
import { useAnalytics } from '@/use/useAnalytics'

Chart.register(...registerables, Annotation)

const { isAnimatingMap } = useAnalytics()

const props = defineProps({
  kpi: {
    type: Object,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  showStdDev: {
    type: Boolean,
    required: true,
  },
})
const emit = defineEmits(['update', 'finished-animation'])

const route = useRoute()
const { t } = useI18n()
const chartCanvas = ref<HTMLCanvasElement | null>(null)
const chartInstance: Ref<Chart | null> = ref(null)
const isAnimating = ref(false) // Ref to track animation state
isAnimatingMap[props.id] = true

const maxValue = Math.max(props.kpi.current, props.kpi.companiesAvg)
const tickStep = maxValue <= 10 ? 1 : Math.ceil(maxValue / 5) // Adjust tick step based on max value

const chartData = {
  labels: [''],
  datasets: [
    {
      label: t('currentCompany'),
      data: [props.kpi.current],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    },
    {
      label: t('allCompanyAverage'),
      data: [props.kpi.companiesAvg],
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
    },
  ],
}

const chartOptions = {
  scales: {
    y: {
      beginAtZero: true,
      stepSize: tickStep,
    },
    x: {
      grid: {
        offset: true,
      },
    },
  },
  plugins: {
    annotation: {
      annotations: [], // Start with empty annotations array
    },
    legend: {
      display: true,
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          let label = context.dataset.label || ''

          if (label) {
            label += ': '
          }
          if (context.parsed.y !== null) {
            label += `${context.parsed.y}${isKpiPercentValue(props.id) ? '%' : ''}`
          }
          return label
        },
      },
    },
  },
  animation: {
    onProgress: () => {
      isAnimating.value = true
      isAnimatingMap[props.id] = true
    },
    onComplete: () => {
      isAnimating.value = false
      isAnimatingMap[props.id] = false
    },
  },
  responsive: true,
  maintainAspectRatio: false,
}

const updateChartAnnotations = () => {
  const annotations: any[] = []
  const kpiWithoutStdDevList = ['totalCompanies', 'avgFeedForwardsPerSurvey']
  if (props.showStdDev && props.kpi?.stdDev && !kpiWithoutStdDevList.includes(props.id)) {
    annotations.push(
      {
        type: 'line',
        id: 'meanLine',
        borderColor: 'rgb(100, 149, 237)',
        borderDash: [6, 6],
        borderDashOffset: 0,
        borderWidth: 3,
        label: {
          display: true,
          backgroundColor: 'rgb(100, 149, 237)',
          content: () => 'Average: ' + +props.kpi.stdDev.mean.toFixed(1),
        },
        scaleID: 'y',
        value: () => +props.kpi.stdDev.mean.toFixed(1),
      },
      {
        type: 'line',
        id: 'upperBoundLine',
        borderColor: 'rgba(102, 102, 102, 0.5)',
        borderDash: [6, 6],
        borderDashOffset: 0,
        borderWidth: 3,
        label: {
          display: true,
          backgroundColor: 'rgba(102, 102, 102, 0.5)',
          color: 'white',
          content: () => +props.kpi.stdDev.upperBound.toFixed(1),
          position: 'start',
        },
        scaleID: 'y',
        value: () => +props.kpi.stdDev.upperBound.toFixed(1),
      },
      {
        type: 'line',
        id: 'lowerBoundLine',
        borderColor: 'rgba(102, 102, 102, 0.5)',
        borderDash: [6, 6],
        borderDashOffset: 0,
        borderWidth: 3,
        label: {
          display: true,
          backgroundColor: 'rgba(102, 102, 102, 0.5)',
          color: 'white',
          content: () => +props.kpi.stdDev.lowerBound.toFixed(1),
          position: 'end',
        },
        scaleID: 'y',
        value: () => +props.kpi.stdDev.lowerBound.toFixed(1),
      }
    )
  }
  chartOptions.plugins.annotation.annotations = annotations
  if (chartInstance.value) {
    chartInstance.value.options.plugins.annotation.annotations = annotations
  }
}

const updateChart = () => {
  if (!props.kpi) return

  const data = props.kpi
  // chartData.labels = props.labels
  chartData.datasets[0].data = [data?.current]
  chartData.datasets[1].data = [data?.companiesAvg]
  updateChartAnnotations()
  emit('update')
}

watch(
  () => props.kpi,
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
        chartInstance.value = new Chart(chartCanvas.value?.getContext('2d')!, {
          // Use non-null assertion here
          type: 'bar',
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
      type: 'bar',
      data: chartData,
      options: chartOptions,
    })
  }
})
</script>

<template>
  <div class="max-h-64 h-64 flex flex-col justify-between">
    <div>
      <v-card-title
        class="!inline text-wrap word-wrap !text-[1.25rem] px-0 py-0 !leading-[1.25rem]"
        :class="{
          'kpi-title--gradient': route.query.cool,
          'kpi-title--gradient-diagonal': route.query.cool === 'diagonal',
        }"
        >{{ t(props.id) }}</v-card-title
      >
    </div>
    <div class="flex-shrink-1">
      <div class="w-full">
        <div class="max-w-[98%] h-52">
          <canvas
            class="-mb-6"
            ref="chartCanvas"
          />
        </div>
      </div>

      <div
        class="grid grid-cols-5 text-center align-center ml-6"
        style="margin-top: -20px"
      >
        <span
          class="!font-bold !text-[1.1rem] text-right col-start-1 col-span-2"
          :style="{ color: CHART_COLORS.blue }"
        >
          {{ props.kpi.current }}{{ isKpiPercentValue(props.id) ? '%' : '' }}
        </span>
        <span class="col-start-3">-</span>
        <span
          class="font-bold !text-[1.1rem] text-left col-start-4 col-span-2"
          :style="{ color: CHART_COLORS.red }"
        >
          {{ props.kpi.companiesAvg }}{{ isKpiPercentValue(props.id) ? '%' : '' }}
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="sass">
:root
  --vue-gradient-1: #299867
  --vue-gradient-2: #48c4a5
  --vue-gradient-3: #26399a
</style>
<style scoped lang="sass">
.kpi-title--gradient
  background: linear-gradient(to right, var(--vue-gradient-1), var(--vue-gradient-2), var(--vue-gradient-3))
  background-clip: text
  color: transparent
  &-diagonal
    background: linear-gradient(155deg, var(--vue-gradient-1) 0%, var(--vue-gradient-2) 45%, var(--vue-gradient-3) 70%)
    background-clip: text
    color: transparent
</style>

<i18n>
en:
  currentCompany: "Company"
  allCompanyAverage: "all companies avg."
de:
  currentCompany: "Unternehmen"
  allCompanyAverage: "Ø aller Unternehmen"
</i18n>
