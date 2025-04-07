<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ComputedRef, Ref, ref, watch } from 'vue'
import { getAllRelevantCompaniesAvgKPIs, transformSurveyData } from '@/utils/transformData'
import { pick } from 'lodash'
import { CHART_COLORS, DASHBOARD_KPI_SORTING_ORDER } from '@/config/constants'
import { RelevantSurveyMetrics, SurveyKPI } from '@/types/SurveyMetrics'
import CompanySelector from '@/components/companySelector.vue'
import { useAnalytics } from '@/use/useAnalytics'
import { Company } from '@/../../server/src/types/api'
import { useUser } from '@/use/useUser'
import LineChart from '@/components/LineChart.vue'

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
const surveyFiltersList: any[] = []
const { companiesList } = useAnalytics()
const { selectedCompaniesList } = useUser()

const applySurveyFilters = (dataList: any[]) => {
  return dataList
}

const selectedCompanies = computed(() => {
  /* if there is a user selection of companies, return the companies */
  return selectedCompaniesList.value.length
    ? selectedCompaniesList.value.map(c => ({ id: c.id, name: c.name }))
    : companiesList.value
})

/* select the first entry so the company selector is filled with a company */
watch(
  () => companiesList.value,
  () => {
    selectedCompany.value = selectedCompanies.value[0]
  },
  { once: true }
)
const selectedCompany: Ref<Company | object> = ref({ name: t('loading'), id: 'loading' })
const selectedCompanyId: ComputedRef<string> = computed(() => selectedCompany.value.id || '')
const selectedCompanyName = computed(() => {
  return props.data?.[selectedCompanyId.value]?.name || ''
})

const selectedCompanySurveysList = computed(() => {
  const surveyList = props.data?.[selectedCompany.value.id]?.surveysList
  return calculateAvgKPIs(surveyList || [])
})

const totalCompanies: ComputedRef<number | undefined> = computed(() => {
  return selectedCompanies.value?.length
})

const calculateAvgKPIs = (surveysList: any[]) => {
  return surveysList.map((survey: any) => {
    const percentageOfFeedforwardsThatWereMarkedDiscussed =
      survey.feedForwardsMarkedDiscussed > 0 ? survey.feedForwardsMarkedDiscussed / survey.totalFeedForwards : 0

    // Average Number of FF per Survey
    const avgFeedForwardsPerQuestion =
      survey.avgQuestionsPerTeam > 0 ? survey.totalFeedForwards / survey.avgQuestionsPerTeam : 0

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
  if (surveyFiltersList.length) {
    return applySurveyFilters(surveyFiltersList)
  }

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

  // if (selectedCompanySurveysList.value.length) {
  //   console.log('summedRelevantCompaniesProcessDataList: ', summedRelevantCompaniesProcessDataList)
  //   console.log('referenceProcessMetrics: ', referenceProcessMetrics)
  // }

  return sortedSummedProcessData
})

const labelsList = computed(() => {
  return []
})
</script>

<template>
  <v-toolbar>
    <v-toolbar-title class="h-auto">
      <div class="text-3xl font-bold flex">
        {{ t('comparison', { companyName: selectedCompanyName }) }}
      </div>
    </v-toolbar-title>
    <v-toolbar-items>
      <CompanySelector
        :companies="selectedCompanies"
        v-model="selectedCompany"
      />
    </v-toolbar-items>
  </v-toolbar>

  <v-row
    class="px-3 py-6 mb-6 gap-4 min-h-64 justify-between"
    v-if="filteredProcessDataList.length"
  >
    <v-card
      v-if="isLoading"
      class="visitor-card"
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
      <v-card-text
        ><div class="min-h-64">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deserunt recusandae tempore totam unde vero
          voluptas. Ab commodi deserunt distinctio esse ipsum modi molestiae, necessitatibus optio quia temporibus?
          Dolor, praesentium vitae?
        </div></v-card-text
      >
    </v-card>
    <template v-else>
      <v-card
        v-for="(kpi, index) in filteredProcessDataList"
        :key="`${kpi.current}-${index}-${kpi.companiesAvg}`"
        class="basis-[100%] sm:basis-[49%] md:basis-[31%] xl:basis-[23%] flex-grow"
        :class="{ 'v-card__loader--hidden': !isLoading }"
        :disabled="isLoading"
        :loading="isLoading"
      >
        <v-card-text>
          <!--        <KPIComparison-->
          <!--          :kpi="kpi"-->
          <!--          :id="DASHBOARD_KPI_SORTING_ORDER[index]"-->
          <!--        />-->
          <LineChart
            :title="t('comparison')"
            :data="kpi"
            :labels="labelsList"
            :color="CHART_COLORS.blue"
            :background-color="'rgba(161,225,255,0.66)'"
          />
        </v-card-text> </v-card
    ></template>
  </v-row>
</template>

<i18n>
en:
  loading: "Loading"
  customerSuccess: "{companyName}'s Customer Success"
  comparison: "Survey Comparison"
de:
  loading: "Laden"
  customerSuccess: "{companyName}'s Kundenerfolg"
  comparison: "Umfrage Vergleich"
</i18n>
