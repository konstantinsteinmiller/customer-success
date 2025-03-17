<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, Ref, ref } from 'vue'
import { useAnalytics } from '@/use/analytics'
import LineChart from '@/components/LineChart.vue'
import { CHART_COLORS } from '@/config/constants'
import DateSelector from '@/components/DateSelector.vue'
import { DateRange } from '@/types/api'

const { t } = useI18n()
const { getVisitorData } = useAnalytics()
const visitorsDataList: Ref<number[]> | Ref<Promise<number[]>> = ref([])
const labelsList: Ref<string[]> = ref([])

const onDateChange = (range: DateRange) => {
  fetchData(range)
}
const fetchData = async (range: DateRange) => {
  const result = await getVisitorData(range)
  labelsList.value = [...Array(result.length).keys()].map(day => day + 1 + '')
  visitorsDataList.value = result
}

const totalVisitors = computed(() => {
  return visitorsDataList.value.reduce((acc, cur) => acc + cur, 0)
})
</script>

<template>
  <v-container>
    <v-toolbar>
      <v-toolbar-title class="text-3xl text-red-400 font-bold">Customer Success</v-toolbar-title>
      <v-spacer />
      <v-btn icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card>
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
  </v-container>
</template>

<style lang="sass" scoped></style>

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
