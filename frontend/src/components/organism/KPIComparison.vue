<script setup lang="ts">
import { Ref, ref } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useI18n } from 'vue-i18n'
import { CHART_COLORS } from '@/config/constants'
import { useRoute } from 'vue-router'
import { isKpiPercentValue } from '@/utils/analytics'
import Annotation from 'chartjs-plugin-annotation'
import { useAnalytics } from '@/use/useAnalytics'
import BaseChart from '@/components/atoms/BaseChart.vue'

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
const emit = defineEmits(['update'])

const route = useRoute()
const { t } = useI18n()

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
  try {
    const annotations: any[] = []
    const kpiWithoutStdDevList = ['totalCompanies']
    if (props.showStdDev && props.kpi?.stdDev && !kpiWithoutStdDevList.includes(props.id)) {
      const lowerBound = props.kpi?.stdDev.lowerBound
      const upperBound = props.kpi?.stdDev.upperBound
      const stdColor = 'rgb(255,0,38)'

      annotations.push(
        {
          type: 'line',
          xScaleID: 'x',
          yScaleID: 'y',
          xMin: 0.2, // Use the same label, but adjust x position
          xMax: 0.2, // Use the same label, but adjust x position
          yMin: lowerBound,
          yMax: upperBound,
          // borderDash: [5, 5],
          borderColor: stdColor,
          borderWidth: 1,
        },
        {
          type: 'line',
          xScaleID: 'x',
          yScaleID: 'y',
          xMin: 0.02, // Use the same label, but adjust x position
          xMax: 0.38, // Use the same label, but adjust x position
          yMin: lowerBound,
          yMax: lowerBound,
          borderColor: stdColor,
          borderWidth: 1,
          // borderDash: [5, 5], // Optional: Add a dash for the lower bound
          label: { enabled: false },
        },
        {
          type: 'line',
          xScaleID: 'x',
          yScaleID: 'y',
          xMin: 0.02, // Use the same label, but adjust x position
          xMax: 0.38, // Use the same label, but adjust x position
          yMin: upperBound,
          yMax: upperBound,
          borderColor: stdColor,
          borderWidth: 1,
          label: { enabled: false },
        }
      )
    }
    chartOptions.plugins.annotation.annotations = annotations
    if (chartInstance.value) {
      chartInstance.value.options.plugins.annotation.annotations = annotations
    }
  } catch (error) {
    console.log('error: ', error)
  }
}

const updateChart = () => {
  if (!props.kpi) return

  const data = props.kpi
  chartData.datasets[0].data = [data?.current]
  chartData.datasets[1].data = [data?.companiesAvg]
  updateChartAnnotations()
  emit('update')
}
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
        <BaseChart
          type="bar"
          class="!w-[98%] !h-52"
          customChartClass="-mb-6"
          :updateChart="updateChart"
          :chartData="chartData"
          :chartOptions="chartOptions"
          :data="kpi"
          @updateInstance="
            () => {
              chartInstance = $event
            }
          "
        />
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
