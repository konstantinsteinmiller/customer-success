<script setup lang="ts">
import { useAnalytics } from '@/use/useAnalytics'
import SelectRelevantCompanies from '@/components/SelectRelevantCompanies.vue'
import { useUser } from '@/use/useUser'

const { getProcessData, companiesToSurveyMap, isLoadingProcessData: isLoading } = useAnalytics()
const { getSelectedCompanies } = useUser()

const fetchData = async () => {
  await Promise.all([getProcessData(), getSelectedCompanies()])
}
fetchData()
</script>

<template>
  <div class="py-4" />
  <SelectRelevantCompanies
    :data="companiesToSurveyMap"
    :isLoading="isLoading"
  />
</template>
