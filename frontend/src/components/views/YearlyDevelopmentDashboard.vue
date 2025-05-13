<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ComputedRef, onMounted, Ref, ref } from 'vue'
import {
  getKpiAvgPerSurvey,
  calculateKpiStandardDeviationsPerSurvey,
  transformSurveyData,
  calculateKpiStandardDeviations,
} from '@/utils/transformData'
import { pick } from 'lodash'
import { PROGRESS_KPI_SORTING_ORDER } from '@/config/constants'
import { KPIData, RelevantSurveyMetrics, SurveyKPI } from '@/types/SurveyMetrics'
import { useUser } from '@/use/useUser'
import MultivalueLineChart from '@/components/organism/MultivalueLineChart.vue'
import draggable from 'vuedraggable'
import { useWidgetOrder } from '@/use/useWidgetOrder'
import DashboardHeader from '@/components/molecules/DashboardHeader.vue'
import Widget from '@/components/organism/Widget.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const { t } = useI18n()
const { selectedCompaniesRef, selectedCompany } = useUser()

const savedShowSdtDev = localStorage.getItem('showStdDev')
const showStdDev: Ref<boolean> = ref(savedShowSdtDev !== null ? JSON.parse(savedShowSdtDev) : false)

const currentDate = new Date()
const oneYearAgo = new Date()
oneYearAgo.setFullYear(currentDate.getFullYear() - 1)

const timeDifference = currentDate.getTime() - oneYearAgo.getTime()
const halfTimeDifference = timeDifference / 2

const firstHalfStartDate = new Date(oneYearAgo.getTime())
const firstHalfEndDate = new Date(oneYearAgo.getTime() + halfTimeDifference)
const secondHalfStartDate = new Date(oneYearAgo.getTime() + halfTimeDifference + 1) // Add 1 millisecond to avoid overlap
const secondHalfEndDate = new Date(currentDate.getTime())
const firstHalfDateString = `${firstHalfStartDate.toISOString().split('T')[0]} - ${firstHalfEndDate.toISOString().split('T')[0]}`
const secondHalfDateString = `${secondHalfStartDate.toISOString().split('T')[0]} - ${secondHalfEndDate.toISOString().split('T')[0]}`

const getHalfYearAggregatedSurveyLists = (surveyList: any[]) => {
  const filteredToFirstHalfSurveysList = surveyList.filter((survey: KPIData) => {
    const surveyEndDate = new Date(survey.endDate)
    return surveyEndDate >= firstHalfStartDate && surveyEndDate <= firstHalfEndDate
  })

  const filteredToSecondHalfSurveysList = surveyList.filter((survey: KPIData) => {
    const surveyEndDate = new Date(survey.endDate)
    return surveyEndDate >= secondHalfStartDate && surveyEndDate <= secondHalfEndDate
  })

  return [calculateAvgKPIs(filteredToFirstHalfSurveysList), calculateAvgKPIs(filteredToSecondHalfSurveysList)]
}

const getTransformedHalfYearKpis = (surveyList: any[]) => {
  let [firstHalfSurveysList, secondHalfSurveysList] = getHalfYearAggregatedSurveyLists(surveyList)
  if (firstHalfSurveysList?.length) {
    firstHalfSurveysList = transformSurveyData(firstHalfSurveysList)
  }
  if (secondHalfSurveysList?.length) {
    secondHalfSurveysList = transformSurveyData(secondHalfSurveysList)
  }
  return [firstHalfSurveysList, secondHalfSurveysList]
}

const selectedCompanySurveysList = computed(() => {
  if (selectedCompany?.value.id === 'loading' || !selectedCompany?.value?.id) return []

  const surveyList = props.data?.[selectedCompany.value.id]?.surveysList || []
  const [firstHalfKpis, secondHalfKpis] = getTransformedHalfYearKpis(surveyList)
  return [firstHalfKpis, secondHalfKpis]
})

const relevantCompaniesWithSurveysList = computed(() => {
  return selectedCompaniesRef.value.length
    ? Object.values(props.data).filter(company => {
        return selectedCompaniesRef.value.some((selected: any) => {
          return company.id === selected.id
        })
      })
    : []
})

const calculateAvgKPIs = (surveysList: any[]): KPIData => {
  return surveysList.map((survey: any) => {
    const percentageOfFeedforwardsThatWereMarkedDiscussed =
      survey.totalFeedForwards > 0 ? (survey.feedForwardsMarkedDiscussed / survey.totalFeedForwards) * 100 : 0

    // Average Number of FF per Survey
    const avgFeedForwardsPerQuestion =
      survey.totalFeedForwards > 0 ? (survey.avgQuestionsPerTeam / survey.totalFeedForwards) * 100 : 0

    const relevantSurveyMetricsList = pick(survey, [
      'avgQuestionsPerTeam',
      'participants',
      'participationRate',
      'totalFeedForwards',

      'feedForwardsPerRespondentPerQuestion',
      'transparencyRate',
      'feedForwardHandlingRate',

      'tasksCreatedFromFeedForwards',
      'closingRatePerSurvey',
      'delegationRate',
    ])

    return {
      ...relevantSurveyMetricsList,
      percentageOfFeedforwardsThatWereMarkedDiscussed,
      avgFeedForwardsPerQuestion,
      id: `${survey.id}-${Math.random()}`,
    }
  })
}

const pickedKpisPerSurveyOfRelevantCompaniesList: ComputedRef<RelevantSurveyMetrics[]> = computed(() =>
  relevantCompaniesWithSurveysList.value.map((company: any) => {
    const [firstHalfKpis, secondHalfKpis] = getTransformedHalfYearKpis(company.surveysList)
    return [firstHalfKpis, secondHalfKpis]
  })
)

const maxSurveys = computed(() => {
  return Math.max(...pickedKpisPerSurveyOfRelevantCompaniesList.value.map(companySurveys => companySurveys.length))
})

const showableSurveys = computed(() => {
  return Math.min(maxSurveys.value, selectedCompanySurveysList.value.length + 5)
})

const filteredProcessDataList = computed(() => {
  if (!selectedCompanySurveysList.value.length) return []

  const withStdDevPerSurveyList = calculateKpiStandardDeviationsPerSurvey(
    relevantCompaniesWithSurveysList.value.map(company => {
      const [firstHalfKpis, secondHalfKpis] = getTransformedHalfYearKpis(company.surveysList)
      /* make some sanity checks. If there are no surveys in first of seconds half of the year
       * for a company, then just duplicate available aggregated Kpis for the half year that
       * is available, otherwise just return empty array. That basically falsifies the data
       * but I don't see a more sane way to handle this right now */
      if (firstHalfKpis instanceof Array && !(secondHalfKpis instanceof Array)) {
        return [secondHalfKpis, secondHalfKpis]
      }
      if (secondHalfKpis instanceof Array && !(firstHalfKpis instanceof Array)) {
        return [firstHalfKpis, firstHalfKpis]
      }
      if (firstHalfKpis instanceof Array && secondHalfKpis instanceof Array) {
        return []
      }
      return [firstHalfKpis, secondHalfKpis]
    })
  )

  const referenceKpisPerSurveyList: RelevantSurveyMetrics = getKpiAvgPerSurvey(
    pickedKpisPerSurveyOfRelevantCompaniesList.value
  )

  const sortedSurveyData = []
  ;[...Array(maxSurveys.value)].forEach((_, surveyIndex) => {
    const survey = referenceKpisPerSurveyList[surveyIndex]

    Object.keys(survey).forEach((key: SurveyKPI) => {
      const index = PROGRESS_KPI_SORTING_ORDER.findIndex((kpi: SurveyKPI) => kpi === key)

      if (index >= 0) {
        /* take the kpi value from the selectedCompanySurveysList.value and set in
         * sortedSurveyData the index sorted. once for
         * the current company and once for the avg of all companies per survey */
        sortedSurveyData[index] = {
          current: selectedCompanySurveysList.value.map(survey => survey[key] || 0).slice(0, showableSurveys.value),
          companiesAvg: referenceKpisPerSurveyList
            .map((survey: any) => survey[key] || 0)
            .slice(0, showableSurveys.value),
          stdDev: showStdDev.value ? withStdDevPerSurveyList[key]?.slice(0, showableSurveys.value) || [] : [],
          id: key,
        }
      }
    })
  })

  return sortedSurveyData
})

const labelsList = computed(() => {
  return [firstHalfDateString, secondHalfDateString]
})

const isMounted: Ref<boolean> = ref(false)
onMounted(() => {
  isMounted.value = true
})

const isLoadingChart = ref(false)
const onToggleStdDev = () => {
  showStdDev.value = !showStdDev.value
  localStorage.setItem('showStdDev', JSON.stringify(showStdDev.value))
  isLoadingChart.value = true
}

const onUpdatedChart = () => {
  isLoadingChart.value = false
}

const drag: Ref<boolean> = ref(false)
const { widgetsList } = useWidgetOrder(filteredProcessDataList, 'progressionWidgetsSortingOrder')
</script>

<template>
  <DashboardHeader
    title="yearlyDevelopment"
    :isLoadingChart="isLoadingChart"
    :showStdDev="showStdDev"
    :onToggleStdDev="onToggleStdDev"
  />

  <v-row
    class="px-3 pt-6 gap-4 min-h-64 justify-between"
    v-if="filteredProcessDataList.length && isMounted"
  >
    <v-card
      v-if="isLoading"
      class="progress-card w-full"
      :class="{ 'v-card__loader--hidden': !isLoading }"
      :disabled="isLoading"
      :loading="isLoading"
    >
      <template #loader="{ isActive }">
        <v-progress-circular
          v-if="isActive"
          :active="isActive"
          :size="70"
          color="amber"
          indeterminate
        />
      </template>
      <v-card-title></v-card-title>
      <v-card-text>
        <div class="min-h-64" />
      </v-card-text>
    </v-card>
    <draggable
      v-model="widgetsList"
      group="kpis"
      @start="drag = true"
      @end="drag = false"
      item-key="id"
      class="flex flex-wrap gap-4 w-full"
    >
      <template #item="{ element }">
        <Widget
          :kpi="element.id"
          :isLoading="isLoading"
        >
          <MultivalueLineChart
            :title="t(element.id)"
            :data="element"
            :id="element.id"
            :showStdDev="showStdDev"
            :labels="labelsList"
            @update="onUpdatedChart"
          />
        </Widget>
      </template>
    </draggable>
  </v-row>
</template>

<style lang="sass" scoped>
:deep(.v-card__loader)
  display: flex
  justify-content: center
  align-items: center
  height: 100%

.v-card
  &.v-card__loader--hidden :deep(.v-card__loader)
    display: none
    z-index: -1
</style>
