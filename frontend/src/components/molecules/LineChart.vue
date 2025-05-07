<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Chart, Tooltip, LineController, LineElement, PointElement, LinearScale, CategoryScale, Legend } from 'chart.js'
import { CHART_COLORS } from '@/config/constants'
Chart.register(LineController, Tooltip, LineElement, PointElement, LinearScale, CategoryScale, Legend)

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  data: {
    type: Array,
    default: () => [],
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
let chartInstance = null

const chartData = {
  labels: props.labels,
  datasets: [
    {
      label: props.title,
      backgroundColor: props.backgroundColor,
      borderColor: props.color,
      borderWidth: 1,
      data: props.data,
      tension: 0.3,
    },
  ],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true, // Allow the y-axis to start from the minimum data value
      grace: '10%', // Add 10% padding above and below the data range
      title: {
        display: true,
        text: props.title, // Add a title to the y-axis
      },
    },
  },
  interaction: {
    mode: 'nearest',
    intersect: false,
  },
  plugins: {
    tooltip: {
      enabled: true, // Enable tooltips
      mode: 'index', // Show tooltip for all datasets at the same index
      intersect: false, // Allow hovering over the line, not just the point
      callbacks: {
        label: context => {
          // Customize the tooltip label
          const label = context.dataset.label || ''
          const value = context.raw
          return `${label}: ${value}`
        },
      },
    },
  },
  legend: {
    display: true, // Ensure the legend is displayed
    position: 'top', // Position the legend at the top
    labels: {
      color: 'black', // Customize legend text color
      font: {
        size: 14, // Customize legend font size
      },
    },
  },
}

watch(
  () => props.data,
  newData => {
    if (chartInstance) {
      chartData.labels = props.labels
      chartData.datasets[0].data = newData
      chartInstance.update()
    }
  },
  { deep: true }
)

// Create the chart when the component is mounted
onMounted(() => {
  const ctx = chartCanvas.value.getContext('2d')
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: chartOptions,
  })
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<template>
  <div class="h-64">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<style scoped lang="sass"></style>
