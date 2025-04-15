<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ComputedRef, onMounted, Ref, ref } from 'vue'
import { getKpiAvgPerSurvey, calculateKpiStandardDeviations } from '@/utils/transformData'
import { pick } from 'lodash'
import { PROGRESS_KPI_SORTING_ORDER } from '@/config/constants'
import { RelevantSurveyMetrics, SurveyKPI } from '@/types/SurveyMetrics'
import CompanySelector from '@/components/companySelector.vue'
import { useUser } from '@/use/useUser'
import MultivalueLineChart from '@/components/MultivalueLineChart.vue'

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

const calculateAvgKPIs = (surveysList: any[]) => {
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

const filteredProcessDataList = computed(() => {
  if (!selectedCompanySurveysList.value.length) return []

  /* avg over all surveys of selected company */
  // if (selectedCompanySurveysList.value?.length)
  //   console.log('selectedCompanySurveysList.value: ', selectedCompanySurveysList.value)

  // console.log(
  //   'pickedKpisPerSurveyOfRelevantCompaniesList: ',
  //   JSON.stringify(pickedKpisPerSurveyOfRelevantCompaniesList.value, undefined, 2)
  // )

  const referenceKpisPerSurveyList: RelevantSurveyMetrics = getKpiAvgPerSurvey(
    pickedKpisPerSurveyOfRelevantCompaniesList.value
  )

  // console.log('referenceKpisPerSurvey: ', referenceKpisPerSurvey, JSON.stringify(referenceKpisPerSurveyList, undefined, 2))

  const withStandardDeviation = calculateKpiStandardDeviations(referenceKpisPerSurveyList)

  // console.log('withStandardDeviation:', withStandardDeviation, JSON.stringify(withStandardDeviation, undefined, 2))
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
          current: selectedCompanySurveysList.value.map(survey => survey[key] || 0),
          companiesAvg: referenceKpisPerSurveyList.map((survey: any) => survey[key] || 0),
          // stdDev: withStandardDeviation[key],
        }
      }
    })
  })
  // console.log('sortedSurveyData: ', sortedSurveyData)

  return sortedSurveyData
})

const labelsList = computed(() => {
  return [...Array(maxSurveys.value)].map((_, index) => `Survey ${index + 1}`) || []
})

const isMounted: Ref<boolean> = ref(false)
onMounted(() => {
  isMounted.value = true
})
</script>

<template>
  <v-toolbar>
    <v-toolbar-title class="h-auto">
      <div class="text-3xl font-bold flex">
        {{ t('comparison', { companyName: selectedCompany?.name }) }}
      </div>
    </v-toolbar-title>
    <v-toolbar-items>
      <CompanySelector
        :companies="selectedCompaniesRef"
        v-model="selectedCompany"
      />
    </v-toolbar-items>
  </v-toolbar>

  <v-row
    class="px-3 py-6 mb-6 gap-4 min-h-64 justify-between"
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
    <template v-else>
      <v-card
        v-for="(kpi, index) in filteredProcessDataList"
        :key="index"
        class="basis-[100%] sm:basis-[49%] md:basis-[31%] xl:basis-[23%] flex-grow"
        :class="{ 'v-card__loader--hidden': !isLoading }"
        :disabled="isLoading"
        :loading="isLoading"
      >
        <v-card-text>
          <MultivalueLineChart
            :title="t(PROGRESS_KPI_SORTING_ORDER[index])"
            :data="kpi"
            :id="PROGRESS_KPI_SORTING_ORDER[index]"
            :labels="labelsList"
          />
        </v-card-text>
      </v-card>
    </template>
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
  customerSuccess: "{companyName}'s Customer Success"
  comparison: "Survey Comparison for {companyName}"
de:
  loading: "Laden"
  customerSuccess: "{companyName}'s Kundenerfolg"
  comparison: "Umfrage Vergleich für {companyName}"
</i18n>
