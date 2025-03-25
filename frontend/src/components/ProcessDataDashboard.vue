<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ComputedRef, Ref, ref, watch } from 'vue'
import { transformSurveyData } from '@/utils/transformData'
import { indexOf, pick } from 'lodash'
import { useRoute } from 'vue-router'

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

const route = useRoute()
const { t } = useI18n()
const surveyFiltersList: any[] = []

/* sort by specific order */
const kpiSortList = [
  'totalSurveys',
  'totalCompanies',

  'avgQuestionsPerTeam',
  'participants',
  'participationRate',
  'totalFeedForwards',

  'avgFeedForwardsPerQuestion',
  'avgFeedForwardsPerSurvey',

  'feedForwardsPerRespondentPerQuestion',
  'transparencyRate',
  'feedForwardHandlingRate',

  'percentageOfFeedforwardsThatWereMarkedDiscussed',

  'tasksCreatedFromFeedForwards',
  'closingRatePerSurvey',
  'delegationRate',
]

const applySurveyFilters = (dataList: any[]) => {
  return dataList
}

const selectedCompanyId: Ref<string> = ref((route.query?.companyId as string) || '')
const selectedCompanyName = computed(() => {
  return props.data?.[selectedCompanyId.value]?.name || ''
})

const selectedCompanySurveysList = computed(() => {
  return calculateAvgKPIs(props.data?.[selectedCompanyId.value]?.surveysList || [])
})

const totalSurveys: ComputedRef<number> = computed(() => {
  return props.data?.[selectedCompanyId.value]?.surveysList.length
})
const totalCompanies: ComputedRef<number | undefined> = computed(() => {
  return Object.keys(props.data)?.length
})

const calculateAvgKPIs = (surveysList: any[]) => {
  return surveysList.map((survey: any) => {
    const percentageOfFeedforwardsThatWereMarkedDiscussed =
      survey.totalFeedForwards / survey.feedForwardsMarkedDiscussed

    // Average Number of FF per Question = Total Number of Feedforwards / Average Questions per Team
    // avgFeedForwardsPerSurvey -> calculated in transformSurveyData

    // Average Number of FF per Survey
    const avgFeedForwardsPerQuestion = survey.totalFeedForwards / survey.avgQuestionsPerTeam

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
      totalSurveys: totalSurveys.value,
      totalCompanies: totalCompanies.value,
      percentageOfFeedforwardsThatWereMarkedDiscussed,
      avgFeedForwardsPerQuestion,
    }
  })
}

watch(
  selectedCompanySurveysList,
  newValue => {
    if (newValue.length) {
      console.log('relevantSurveyMetricsList: ', selectedCompanySurveysList.value)
    }
  },
  { immediate: true }
)

const filteredProcessDataList = computed(() => {
  if (surveyFiltersList.length) {
    return applySurveyFilters(surveyFiltersList)
  }

  // console.log('selectedCompanySurveysList.value: ', selectedCompanySurveysList.value)
  const summedProcessData = transformSurveyData(selectedCompanySurveysList.value)
  const summedRelevantCompaniesProcessDataList = Object.values(props.data).map((company: any) => {
    const companySurveysList = calculateAvgKPIs(company.surveysList)
    return transformSurveyData(companySurveysList)
  })

  const sortedSummedProcessData = []
  Object.keys(summedProcessData).forEach((key: string) => {
    const index = kpiSortList.findIndex(kpi => kpi === key)

    if (index >= 0) {
      /* take the kpi value from the summedProcessData and set in
       * sortedSummedProcessData the index sorted */
      sortedSummedProcessData[index] = summedProcessData[key]
    }
  })
  console.log('sortedSummedProcessData: ', sortedSummedProcessData)
  // summedProcessData

  if (selectedCompanySurveysList.value.length) {
    console.log('summedProcessData: ', summedProcessData)
    console.log('summedRelevantCompaniesProcessDataList: ', summedRelevantCompaniesProcessDataList)
  }

  return sortedSummedProcessData
})
</script>

<template>
  <v-toolbar>
    <v-toolbar-title class="text-3xl font-bold"
      >{{ t('customerSuccess', { companyName: selectedCompanyName }) }}
    </v-toolbar-title>
    <!--    <v-spacer />-->
    <!--    <v-btn icon>-->
    <!--      <v-icon>mdi-dots-vertical</v-icon>-->
    <!--    </v-btn>-->
  </v-toolbar>

  <v-row class="px-3 py-6 mb-6 gap-4 justify-between">
    <v-card
      v-for="(kpi, index) in filteredProcessDataList"
      :key="kpi"
      class="basis-[31%] flex-grow"
      :class="{ 'v-card__loader--hidden': !isLoading }"
      :disabled="isLoading"
      :loading="isLoading"
    >
      <v-card-text>{{ kpiSortList[index] }}: {{ kpi }}</v-card-text>
    </v-card>
  </v-row>
</template>

<style scoped lang="sass"></style>

<i18n>
en:
  customerSuccess: "{companyName}'s Customer Success"
de:
  customerSuccess: "{companyName}'s Kundenerfolg"
</i18n>
