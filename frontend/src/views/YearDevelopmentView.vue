<script setup lang="ts">
import { Ref, ref } from 'vue'
import { useAnalytics } from '@/use/useAnalytics'
import { useUser } from '@/use/useUser'
import { Company } from '@/../../server/src/types/api'
import YearlyDevelopmentDashboard from '@/components/views/YearlyDevelopmentDashboard.vue'
import { isPrinting } from '@/utils/pdf'

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
  <div
    class="pdf-screen-target pb-8"
    :class="{ 'pdf-screen-target--print-pdf': isPrinting }"
  >
    <YearlyDevelopmentDashboard
      :data="companiesToSurveyMap"
      :isLoading="isLoading"
    />
  </div>
</template>

<style lang="sass" scoped></style>
