<script setup lang="ts">
import { Ref, ref } from 'vue'
import { useAnalytics } from '@/use/useAnalytics'
import { useUser } from '@/use/useUser'
import { Company } from '@/../../server/src/types/api'
import SurveyProgressionDashboard from '@/components/SurveyProgressionDashboard.vue'

const { getProcessData, companiesToSurveyMap } = useAnalytics()
const { selectedCompaniesList } = useUser()

const isLoading: Ref<boolean> = ref(false)

const fetchData = async () => {
  isLoading.value = true
  try {
    const [processResult] = await Promise.all([getProcessData()])

    /* filter out non-selected companies from processResult */
    companiesToSurveyMap.value = {}
    if (selectedCompaniesList.value.length) {
      selectedCompaniesList.value.forEach((selected: Company) => {
        companiesToSurveyMap.value[selected.id] = processResult[selected.id]
      })
    } else {
      companiesToSurveyMap.value = processResult
    }
  } catch (e) {
    console.log('something went wrong: ')
  } finally {
    isLoading.value = false
  }
}
fetchData()
</script>

<template>
  <SurveyProgressionDashboard
    :data="companiesToSurveyMap"
    :isLoading="isLoading"
  />
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
