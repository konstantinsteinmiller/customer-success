<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ComputedRef, onMounted, Ref, ref, watch } from 'vue'
import { getKpiAvgPerSurvey, calculateKpiStandardDeviationsPerSurvey } from '@/utils/transformData'
import { pick } from 'lodash'
import { PROGRESS_KPI_SORTING_ORDER } from '@/config/constants'
import { KPIData, RelevantSurveyMetrics, SurveyKPI } from '@/types/SurveyMetrics'
import { useUser } from '@/use/useUser'
import MultivalueLineChart from '@/components/MultivalueLineChart.vue'
import draggable from 'vuedraggable'
import { useWidgetOrder } from '@/use/useWidgetOrder'
import DashboardHeader from '@/components/molecules/DashboardHeader.vue'

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

const selectedCompanySurveysList = computed(() => {
  if (selectedCompany?.value.id === 'loading') return []

  const surveyList = props.data?.[selectedCompany.value.id]?.surveysList
  return calculateAvgKPIs(surveyList || [])
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
    return calculateAvgKPIs(company.surveysList)
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
    relevantCompaniesWithSurveysList.value.map(company =>
      JSON.parse(JSON.stringify(calculateAvgKPIs(company.surveysList)))
    )
  )

  const referenceKpisPerSurveyList: RelevantSurveyMetrics = getKpiAvgPerSurvey(
    pickedKpisPerSurveyOfRelevantCompaniesList.value
  )

  const sortedSurveyData = []
  ;[...Array(maxSurveys.value)].forEach((_, surveyIndex) => {
    const survey = referenceKpisPerSurveyList[surveyIndex]
    // console.log('survey: ', survey, ' - survey no. ', surveyIndex)

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
  return [...Array(maxSurveys.value)].map((_, index) => `Survey ${index + 1}`).slice(0, showableSurveys.value) || []
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

let storedKpiPrintHideList = localStorage.getItem('showPrintHide')
storedKpiPrintHideList = storedKpiPrintHideList ? JSON.parse(storedKpiPrintHideList) : null

console.log('storedKpiPrintHideList: ', storedKpiPrintHideList)
const kpiPrintMap: Ref<Map<string, boolean>> = ref(new Map())
if (storedKpiPrintHideList?.length) {
  storedKpiPrintHideList?.forEach(([kpi, value]: [string, boolean]) => {
    kpiPrintMap.value.set(kpi, value)
  })
}

const togglePrintHide = (kpi: string) => {
  kpiPrintMap.value.set(kpi, !kpiPrintMap.value.get(kpi))
  const greyedOutKpisList = Array.from(kpiPrintMap.value.entries()).filter(([kpi, value]) => value)

  localStorage.setItem('showPrintHide', JSON.stringify(greyedOutKpisList))
}
</script>

<template>
  <DashboardHeader
    title="comparison"
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
        <v-card
          :key="element.id"
          class="basis-[100%] sm:basis-[49%] md:basis-[49%] xl:basis-[31%] flex-grow"
          :class="{
            'v-card__loader--hidden': !isLoading,
            [`card-${element.id}`]: true,
            'card--greyed-out': !!kpiPrintMap.get(element.id),
          }"
          :disabled="isLoading"
          :loading="isLoading"
        >
          <template #title>
            <v-fab
              class="ms-4 absolute mt-6 mr-1 z-100 opacity-100 hover:opacity-100"
              icon="mdi-plus"
              location="top end"
              size="small"
              absolute
              offset
              @click="togglePrintHide(element.id)"
            ></v-fab>
          </template>
          <v-card-text>
            <MultivalueLineChart
              :title="t(element.id)"
              :data="element"
              :id="element.id"
              :showStdDev="showStdDev"
              :labels="labelsList"
              @update="onUpdatedChart"
            />
          </v-card-text>
        </v-card>
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
  &.card--greyed-out
    background-color: #f5f5f5
    opacity: 0.4
    pointer-events: none
  &.card--print-pdf-hidden
    display: none
    z-index: -1
  &.v-card__loader--hidden :deep(.v-card__loader)
    display: none
    z-index: -1
</style>
