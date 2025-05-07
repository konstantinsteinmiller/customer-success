<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, Ref, ref } from 'vue'
import { useAnalytics } from '@/use/useAnalytics'
import LineChart from '@/components/molecules/LineChart.vue'
import { CHART_COLORS } from '@/config/constants'
import DateSelector from '@/components/molecules/DateSelector.vue'
import { DateRange } from '@/types/api'

const { t } = useI18n()
const { getVisitorData, visitorsDataList } = useAnalytics()

const isLoading = ref(false)

const labelsList: Ref<string[]> = ref([])

const onDateChange = (range: DateRange) => fetchData(range)
const fetchData = async (range: DateRange) => {
  isLoading.value = true
  try {
    const visitorsResult = await getVisitorData(range)
    labelsList.value = [...Array(visitorsResult.length).keys()].map(day => day + 1 + '')
    visitorsDataList.value = visitorsResult
  } catch (e) {
    console.log('something went wrong: ')
  } finally {
    isLoading.value = false
  }
}

const totalVisitors = computed(() => {
  return visitorsDataList.value.reduce((acc, cur) => acc + cur, 0)
})
</script>

<template>
  <v-toolbar
    class="mb-4"
    color="surface"
    elevation="1"
    height="66"
  >
    <template #title>
      <h2 class="text-h5 p-2 font-weight-bold">{{ t('title') }}</h2>
    </template>
  </v-toolbar>

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
  </v-card>
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
  yesRemove: "Yes Remove"
  cancel: "Cancel"
  title: "Webpage Analytics"
  visitors: "Visitors"
de:
  yesRemove: "Ja, entfernen"
  cancel: "Abbrechen"
  title: "Webseite Analytics"
  visitors: "Webseite Besucher"
</i18n>
