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
import CompanySelector from '@/components/companySelector.vue'
import { useUser } from '@/use/useUser'

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
      return transformSurveyData(companySurveysList)
    }
  )

  const referenceProcessMetrics: RelevantSurveyMetrics = getAllRelevantCompaniesAvgKPIs(
    summedRelevantCompaniesProcessDataList
  )

  const withStdDevPerSurveyList = pickedKpisPerSurveyOfRelevantCompaniesList.value.map(surveyList => {
    let data = calculateAvgKPIs(surveyList)
    data = addCalculatedKpis(data)
    // console.log('data: ', data)
    return calculateKpiStandardDeviationsPerCompany(JSON.parse(JSON.stringify(data)))
  })
  const withStdDevPerSurveyCompanyAvg = getStdAvgOverCompanies(withStdDevPerSurveyList)

  const sortedSummedProcessData = []
  Object.keys(summedProcessData).forEach((key: SurveyKPI) => {
    const index = DASHBOARD_KPI_SORTING_ORDER.findIndex((kpi: SurveyKPI) => kpi === key)

    if (index >= 0) {
      /* take the kpi value from the summedProcessData and set in
       * sortedSummedProcessData the index sorted. once for
       * the current company and once for the avg over all companies */

      sortedSummedProcessData[index] = {
        current: +summedProcessData[key] /*?.toFixed(2)*/,
        companiesAvg: +referenceProcessMetrics[key] /*?.toFixed(2)*/,
        stdDev: showStdDev.value ? withStdDevPerSurveyCompanyAvg[key] : [],
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
</script>

<template>
  <v-toolbar
    color="surface"
    elevation="1"
    height="66"
    class=""
  >
    <template #title>
      <h2 class="text-h5 p-2 font-weight-bold">{{ t('customerSuccess', { companyName: selectedCompany?.name }) }}</h2>
    </template>
    <v-toolbar-items>
      <div class="flex justify-center items-center">
        <v-btn
          class="py-2"
          variant="elevated"
          color="outline"
          size="large"
          :loading="isLoadingChart"
          :disabled="isLoadingChart"
          @click="onToggleStdDev"
        >
          {{ showStdDev ? t('hide') : t('show') }} {{ t('stdDev') }}
        </v-btn>
      </div>
      <CompanySelector
        :companies="selectedCompaniesRef"
        v-model="selectedCompany"
      />
    </v-toolbar-items>
  </v-toolbar>

  <v-row
    class="px-3 pt-6 gap-4 justify-between"
    v-if="filteredProcessDataList.length"
  >
    <v-card
      v-for="(kpi, index) in filteredProcessDataList"
      :key="`${kpi.current}-${index}-${kpi.companiesAvg}`"
      class="basis-[100%] sm:basis-[49%] md:basis-[31%] xl:basis-[23%] flex-grow"
      :class="{ 'v-card__loader--hidden': !isLoading }"
      :disabled="isLoading"
      :loading="isLoading"
    >
      <v-card-text>
        <KPIComparison
          :kpi="kpi"
          :id="DASHBOARD_KPI_SORTING_ORDER[index]"
          :showStdDev="showStdDev"
          @update="onUpdatedChart"
        />
      </v-card-text>
    </v-card>
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

<i18n>
en:
  loading: "Loading"
  customerSuccess: "{companyName}'s KPIs"
de:
  loading: "Laden"
  customerSuccess: "{companyName}'s KPIs"
</i18n>
