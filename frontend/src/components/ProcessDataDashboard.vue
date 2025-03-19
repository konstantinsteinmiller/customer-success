<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { transformSurveyData } from '@/utils/transformData'

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const { t } = useI18n()
const surveyFiltersList: any[] = []
const applySurveyFilters = (dataList: any[]) => {
  return []
}
const filteredProcessDataList = computed(() => {
  if (surveyFiltersList.length) {
    return applySurveyFilters(surveyFiltersList)
  }

  const summedProcessData = transformSurveyData(props.data)
  console.log('summedProcessData: ', summedProcessData)
  return summedProcessData
})
</script>

<template>
  <v-row class="px-3 py-6 gap-4">
    <v-card
      v-for="(metric, key) in filteredProcessDataList"
      :key="key"
      :class="{ 'v-card__loader--hidden': !isLoading }"
      :disabled="isLoading"
      :loading="isLoading"
    >
      <v-card-text>{{ key }}: {{ metric }}</v-card-text>
    </v-card>
  </v-row>
</template>

<style scoped lang="sass"></style>

<i18n></i18n>
