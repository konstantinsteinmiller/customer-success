<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ComputedRef, ref, Ref } from 'vue'
import {
  addCalculatedKpis,
  calculateKpiStandardDeviationsPerCompany,
  getAllRelevantCompaniesAvgKPIs,
  getStdAvgOverCompanies,
  transformSurveyData,
} from '@/utils/transformData'
import { pick } from 'lodash'
import { DASHBOARD_KPI_SORTING_ORDER } from '@/config/constants'
import { RelevantSurveyMetrics, SurveyKPI } from '@/types/SurveyMetrics'
import KPIComparison from '@/components/KPIComparison.vue'
import { useUser } from '@/use/useUser'
import draggable from 'vuedraggable'
import { useWidgetOrder } from '@/use/useWidgetOrder'
import DashboardHeader from '@/components/molecules/DashboardHeader.vue'
import MultivalueLineChart from '@/components/MultivalueLineChart.vue'
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
const { selectedCompaniesRef, selectedCompany, totalCompanies } = useUser()

const savedShowSdtDev = localStorage.getItem('showStdDev')
const showStdDev: Ref<boolean> = ref(savedShowSdtDev !== null ? JSON.parse(savedShowSdtDev) : false)
const avgFeedForwardsPerSurveyList = ref([])

const selectedCompanySurveysList = computed(() => {
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

const calculateAvgKPIs = (surveysList: any[]) => {
  return surveysList.map((survey: any) => {
    const percentageOfFeedforwardsThatWereMarkedDiscussed =
      survey.totalFeedForwards > 0 && survey.feedForwardsMarkedDiscussed !== undefined
        ? (survey.feedForwardsMarkedDiscussed / survey.totalFeedForwards) * 100
        : 0

    // Average Number of FF per Survey
    const avgFeedForwardsPerQuestion =
      survey.totalFeedForwards > 0 ? (survey.avgQuestionsPerTeam / survey.totalFeedForwards) * 100 : 0

    const relevantSurveyMetricsList = pick(survey, [
      'avgQuestionsPerTeam',
      'participants',
      'participationRate',
      'totalFeedForwards',
      'feedForwardsMarkedDiscussed',

      'feedForwardsPerRespondentPerQuestion',
      'transparencyRate',
      'feedForwardHandlingRate',

      'tasksCreatedFromFeedForwards',
      'closingRatePerSurvey',
      'delegationRate',
    ])

    return {
      ...relevantSurveyMetricsList,
      totalSurveys: surveysList.length,
      totalCompanies: totalCompanies.value,
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

const filteredProcessDataList = computed(() => {
  /* avg over all surveys of selected company */
  const summedProcessData = transformSurveyData(selectedCompanySurveysList.value)
  const summedRelevantCompaniesProcessDataList: RelevantSurveyMetrics[] = relevantCompaniesWithSurveysList.value.map(
    (company: any) => {
      const companySurveysList = calculateAvgKPIs(company.surveysList)
      const transformedSurveyKpiData = transformSurveyData(companySurveysList)
      avgFeedForwardsPerSurveyList.value.push(transformedSurveyKpiData['avgFeedForwardsPerSurvey'])
      return transformedSurveyKpiData
    }
  )

  const referenceProcessMetrics: RelevantSurveyMetrics = getAllRelevantCompaniesAvgKPIs(
    summedRelevantCompaniesProcessDataList
  )

  const withStdDevPerSurveyList = pickedKpisPerSurveyOfRelevantCompaniesList.value.map(surveyList => {
    let data = calculateAvgKPIs(surveyList)
    data = addCalculatedKpis(data)
    return calculateKpiStandardDeviationsPerCompany(JSON.parse(JSON.stringify(data)))
  })
  const withStdDevPerSurveyCompanyAvg = getStdAvgOverCompanies(
    withStdDevPerSurveyList,
    avgFeedForwardsPerSurveyList.value
  )

  const sortedSummedProcessData = []
  Object.keys(summedProcessData).forEach((key: SurveyKPI) => {
    const index = DASHBOARD_KPI_SORTING_ORDER.findIndex((kpi: SurveyKPI) => kpi === key)

    if (index >= 0) {
      /* take the kpi value from the summedProcessData and set in
       * sortedSummedProcessData the index sorted. once for
       * the current company and once for the avg over all companies */

      sortedSummedProcessData[index] = {
        current: +summedProcessData[key],
        companiesAvg: +referenceProcessMetrics[key],
        stdDev: showStdDev.value ? withStdDevPerSurveyCompanyAvg[key] : [],
        id: key,
      }
    }
  })

  return sortedSummedProcessData
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

const drag = ref(false)
const { widgetsList } = useWidgetOrder(filteredProcessDataList, 'barChartsWidgetsSortingOrder')
</script>

<template>
  <DashboardHeader
    title="customerSuccess"
    :isLoadingChart="isLoadingChart"
    :showStdDev="showStdDev"
    :onToggleStdDev="onToggleStdDev"
  />

  <v-row
    class="px-3 pt-6 gap-4 min-h-64 justify-between"
    v-if="filteredProcessDataList.length"
  >
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
          <KPIComparison
            :kpi="element"
            :id="element.id"
            :showStdDev="showStdDev"
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
