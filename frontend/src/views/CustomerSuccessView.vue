<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, Ref, ref } from 'vue'
import { useAnalytics } from '@/use/analytics'
import LineChart from '@/components/LineChart.vue'
import { CHART_COLORS } from '@/config/constants'
import DateSelector from '@/components/DateSelector.vue'
import { DateRange } from '@/types/api'
import { CompanyToSurveyMap } from '@/../../server/src/types/api'
import ProcessDataDashboard from '@/components/ProcessDataDashboard.vue'

const { t } = useI18n()
const { getVisitorData, getProcessData } = useAnalytics()

const isLoading = ref(false)

const visitorsDataList: Ref<number[]> | Ref<Promise<number[]>> = ref([])
const labelsList: Ref<string[]> = ref([])

const companiesToSurveyMap: Ref<CompanyToSurveyMap> | Ref<Promise<CompanyToSurveyMap>> = ref([])

const onDateChange = (range: DateRange) => fetchData(range)
const fetchData = async (range: DateRange) => {
  isLoading.value = true
  try {
    const [visitorsResult, processResult] = await Promise.all([getVisitorData(range), getProcessData()])

    isLoading.value = false
    labelsList.value = [...Array(visitorsResult.length).keys()].map(day => day + 1 + '')
    visitorsDataList.value = visitorsResult

    companiesToSurveyMap.value = processResult
    // console.log('companiesToSurveyMap: ', companiesToSurveyMap.value)
  } finally {
    isLoading.value = false
  }
}

const totalVisitors = computed(() => {
  return visitorsDataList.value.reduce((acc, cur) => acc + cur, 0)
})
</script>

<template>
  <v-container>
    <ProcessDataDashboard
      :data="companiesToSurveyMap"
      :isLoading="isLoading"
    />

    <v-card
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
      <v-card-text>
        <v-row class="items-center">
          <div class="text-2xl ml-4">{{ `${totalVisitors} ${t('visitors')}` }}</div>
          <v-spacer />
          <v-spacer />
          <v-spacer />
          <v-spacer />
          <v-spacer />
          <DateSelector @update:model-value="onDateChange" />
        </v-row>

        <LineChart
          :title="t('visitors')"
          :data="visitorsDataList"
          :labels="labelsList"
          :color="CHART_COLORS.red"
          :background-color="'rgba(255,161,161,0.66)'"
        />
      </v-card-text>
      <!--      <v-card-actions>
        <v-btn
          theme="dark"
          color="primary"
        >
          {{ t('yesRemove') }}
        </v-btn>
        <v-btn variant="text">
          {{ t('cancel') }}
        </v-btn>
      </v-card-actions>-->
    </v-card>

    <!--    <v-card>
      <div class="px-4 mb-2">
        <v-chip-group selected-class="bg-deep-purple-lighten-2">
          <v-chip>5:30PM</v-chip>

          <v-chip>7:30PM</v-chip>

          <v-chip>8:00PM</v-chip>

          <v-chip>9:00PM</v-chip>
        </v-chip-group>
      </div>
    </v-card>-->
  </v-container>
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
</style>

<i18n>
en:
  welcome: Welcome! You are logged in
  yesRemove: Yes Remove
  cancel: Cancel
  visitors: Visitors
de:
  welcome: Willkommen! Sie sind angemeldet
  yesRemove: Ja, entfernen
  cancel: Abbrechen
  visitors: Besucher
</i18n>
