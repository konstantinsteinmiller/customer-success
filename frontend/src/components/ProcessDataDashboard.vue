<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { getAllRelevantCompaniesAvgKPIs, transformSurveyData } from '@/utils/transformData'
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

const selectedCompanySurveysList = computed(() => {
  const surveyList = props.data?.[selectedCompany.value.id]?.surveysList
  return calculateAvgKPIs(surveyList || [])
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
      totalSurveys: surveysList.length,
      totalCompanies: totalCompanies.value,
      percentageOfFeedforwardsThatWereMarkedDiscussed,
      avgFeedForwardsPerQuestion,
    }
  })
}

const filteredProcessDataList = computed(() => {
  /* avg over all surveys of selected company */
  const summedProcessData = transformSurveyData(selectedCompanySurveysList.value)
  const summedRelevantCompaniesProcessDataList: RelevantSurveyMetrics[] = Object.values(props.data).map(
    (company: any) => {
      const companySurveysList = calculateAvgKPIs(company.surveysList)
      return transformSurveyData(companySurveysList)
    }
  )

  const referenceProcessMetrics: RelevantSurveyMetrics = getAllRelevantCompaniesAvgKPIs(
    summedRelevantCompaniesProcessDataList
  )

  const sortedSummedProcessData = []
  Object.keys(summedProcessData).forEach((key: SurveyKPI) => {
    const index = DASHBOARD_KPI_SORTING_ORDER.findIndex((kpi: SurveyKPI) => kpi === key)

    if (index >= 0) {
      /* take the kpi value from the summedProcessData and set in
       * sortedSummedProcessData the index sorted. once for
       * the current company and once for the avg over all companies */
      sortedSummedProcessData[index] = {
        current: summedProcessData[key],
        companiesAvg: referenceProcessMetrics[key],
      }
    }
  })

  return sortedSummedProcessData
})
</script>

<template>
  <v-toolbar>
    <v-toolbar-title class="h-auto">
      <div class="text-3xl font-bold flex">
        {{ t('customerSuccess', { companyName: selectedCompany?.name }) }}
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
    class="px-3 py-6 mb-6 gap-4 justify-between"
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
        />
      </v-card-text>
    </v-card>
  </v-row>
</template>

<i18n>
en:
  loading: "Loading"
  customerSuccess: "{companyName}'s Customer Success"
de:
  loading: "Laden"
  customerSuccess: "{companyName}'s Kundenerfolg"
</i18n>
