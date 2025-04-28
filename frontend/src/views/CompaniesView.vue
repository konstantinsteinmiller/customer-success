<script setup lang="ts">
import { useAnalytics } from '@/use/useAnalytics'
import SelectRelevantCompanies from '@/components/SelectRelevantCompanies.vue'

const { getProcessData, companiesToSurveyMap, isLoadingProcessData: isLoading } = useAnalytics()

const fetchData = async () => {
  await Promise.all([getProcessData()])
}
fetchData()
</script>

<template>
  <SelectRelevantCompanies
    :data="companiesToSurveyMap"
    :isLoading="isLoading"
  />
</template>
