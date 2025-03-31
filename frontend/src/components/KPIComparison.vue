<script setup lang="ts">
import { onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useI18n } from 'vue-i18n'
import { CHART_COLORS } from '@/config/constants'
import { useRoute } from 'vue-router'

Chart.register(...registerables)
const route = useRoute()

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
})

const { t } = useI18n()

onMounted(() => {
  const maxValue = Math.max(props.kpi.current, props.kpi.companiesAvg)
  const tickStep = maxValue <= 10 ? 1 : Math.ceil(maxValue / 5) // Adjust tick step based on max value

  new Chart(`chart-${props.id}`, {
    type: 'bar',
    data: {
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
    },
    options: {
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
                label += `${context.parsed.y}${isPercentValue(props.id) ? '%' : ''}`
              }
              return label
            },
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    },
  })
})

const percentValuesList = [
  'transparencyRate',
  'feedForwardHandlingRate',
  'delegationRate',
  'closingRatePerSurvey',
  'participationRate',
  'percentageOfFeedforwardsThatWereMarkedDiscussed',
]
const isPercentValue = (value: string) => {
  return percentValuesList.includes(value)
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
        <div class="max-w-[98%] h-52">
          <canvas
            class="-mb-6"
            :id="`chart-${props.id}`"
          ></canvas>
        </div>
      </div>

      <div
        class="text-center align-center"
        style="margin-top: -20px"
      >
        <b
          :style="{
            color: CHART_COLORS.blue,
            // textShadow: `#299867 0 0 1px`,
          }"
          >{{ props.kpi.current }}{{ isPercentValue(props.id) ? '%' : '' }}</b
        >
        &nbsp;&nbsp;-&nbsp;&nbsp;
        <b
          :style="{
            color: CHART_COLORS.red,
            // textShadow: `#299867 0 0 1px`,
          }"
          >{{ props.kpi.companiesAvg }}{{ isPercentValue(props.id) ? '%' : '' }}</b
        >
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
  totalSurveys: "Total surveys"
  totalCompanies: "Total companies"
  avgQuestionsPerTeam: "Avg. questions per team"
  participants: "Participants"
  participationRate: "Participation rate"
  totalFeedForwards: "Total FeedForwards"
  avgFeedForwardsPerQuestion: "Avg. FeedForwards per question"
  avgFeedForwardsPerSurvey: "Avg. FeedForwards per survey"
  feedForwardsPerRespondentPerQuestion: "FeedForwards per respondent per question"
  transparencyRate: "Transparency rate"
  feedForwardHandlingRate: "FeedForward handling rate"
  percentageOfFeedforwardsThatWereMarkedDiscussed: "% Feedforwards marked discussed"
  tasksCreatedFromFeedForwards: "Tasks created from FeedForwards"
  closingRatePerSurvey: "Closing rate per survey"
  delegationRate: "Delegation rate"
de:
  currentCompany: "Unternehmen"
  allCompanyAverage: "Ø aller Unternehmen"
  totalSurveys: "Gesamt Umfragen"
  totalCompanies: "Gesamt Unternehmen"
  avgQuestionsPerTeam: "Ø Fragen pro Team"
  participants: "Teilnehmer"
  participationRate: "Teilnahmequote"
  totalFeedForwards: "Gesamt FeedForwards"
  avgFeedForwardsPerQuestion: "Ø FeedForwards pro Frage"
  avgFeedForwardsPerSurvey: "Ø FeedForwards pro Umfrage"
  feedForwardsPerRespondentPerQuestion: "FeedForwards pro Befragtem pro Frage"
  transparencyRate: "Transparenzrate"
  feedForwardHandlingRate: "FeedForward-Bearbeitungsrate"
  percentageOfFeedforwardsThatWereMarkedDiscussed: "% Feedforwards als diskutiert markiert"
  tasksCreatedFromFeedforwards: "Aufgaben aus Feedforwards erstellt"
  closingRatePerSurvey: "Abschlussrate pro Umfrage"
  delegationRate: "Delegationsrate"
</i18n>
