<script setup lang="ts">
import { ref, Ref } from 'vue'
import {
  Chart,
  Tooltip,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Legend,
  Filler,
} from 'chart.js'
import { CHART_COLORS } from '@/config/constants'
import { useI18n } from 'vue-i18n'
import { isKpiPercentValue } from '@/utils/analytics'
import { useAnalytics } from '@/use/useAnalytics'
import { useRoute } from 'vue-router'
import BaseChart from '@/components/atoms/BaseChart.vue'

Chart.register(LineController, Tooltip, LineElement, PointElement, LinearScale, CategoryScale, Legend, Filler)

const { t } = useI18n()
const route = useRoute()
const { isAnimatingMap } = useAnalytics()
const emit = defineEmits(['update'])
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
  showStdDev: {
    type: Boolean,
    default: false,
  },
})

const chartInstance: Ref<Chart | null> = ref(null)
const isAnimating = ref(false) // Ref to track animation state
isAnimatingMap[props.id] = true

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
    {
      label: t('upperbound'),
      backgroundColor: `rgba(161, 255, 177, 0.66)`,
      borderColor: CHART_COLORS.green,
      borderWidth: 1,
      data: [], // Will be populated from data
      tension: 0.3,
      fill: 3,
    },
    {
      label: t('lowerbound'),
      backgroundColor: `rgba(161, 255, 205, 0.66)`,
      borderColor: CHART_COLORS.green,
      borderWidth: 1,
      data: [], // Will be populated from data
      tension: 0.3,
    },
  ],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      grace: '10%',
      title: {
        display: true,
        text: '',
      },
    },
  },
  interaction: {
    mode: 'nearest',
    intersect: false,
  },
  plugins: {
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
      isAnimatingMap[props.id] = true
    },
    onComplete: () => {
      isAnimating.value = false
      isAnimatingMap[props.id] = false
    },
  },
}

const updateChart = () => {
  if (!props.data) return

  const data = props.data
  chartData.labels = props.labels
  chartData.datasets[0].data = data?.current.map(i => +i?.toFixed(2)) || []
  chartData.datasets[1].data = data?.companiesAvg.map(i => +i?.toFixed(2)) || []
  if (props.showStdDev && data?.stdDev) {
    chartData.datasets[2].data = data?.stdDev?.map(i => i?.upperBound) || []
    chartData.datasets[3].data = data?.stdDev?.map(i => i?.lowerBound) || []
  } else {
    chartData.datasets[2].data = []
    chartData.datasets[3].data = []
  }
  emit('update')
}
</script>

<template>
  <div class="pb-2">
    <v-card-title
      class="!inline text-wrap word-wrap !text-[1.25rem] px-0 py-0 !leading-[1.25rem]"
      :class="{
        'kpi-title--gradient': route.query.cool,
        'kpi-title--gradient-diagonal': route.query.cool === 'diagonal',
      }"
      >{{ t(props.id) }}</v-card-title
    >
  </div>

  <BaseChart
    type="line"
    class="h-80 relative"
    customChartClass="absolute top-0 left-0"
    :updateChart="updateChart"
    :chartData="chartData"
    :chartOptions="chartOptions"
    :data="data"
    @updateInstance="
      () => {
        chartInstance = $event
      }
    "
  />
</template>

<i18n>
en:
  avgCompanies: 'Avg. Companies'
  current: 'Selected Company'
de:
  avgCompanies: 'Avg. Unternehmen'
  current: 'Ausgewähltes Unternehmen'
</i18n>
