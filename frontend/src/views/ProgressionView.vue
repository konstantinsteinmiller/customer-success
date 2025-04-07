<script setup lang="ts">
import { Ref, ref } from 'vue'
import { useAnalytics } from '@/use/useAnalytics'
import { useUser } from '@/use/useUser'
import { Company } from '@/../../server/src/types/api'
import SurveyProgressionDashboard from '@/components/SurveyProgressionDashboard.vue'

const { getProcessData, companiesToSurveyMap } = useAnalytics()
const { getSelectedCompanies, selectedCompaniesList } = useUser()

const isLoading: Ref<boolean> = ref(false)

const fetchData = async () => {
  isLoading.value = true
  try {
    const [processResult] = await Promise.all([getProcessData(), getSelectedCompanies()])

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
  <!--  <div class="py-4" />-->
  <!--  <v-toolbar class="">-->
  <!--    <v-toolbar-title class="h-auto">-->
  <!--      <div class="text-3xl font-bold flex">{{ t('comparison') }}</div>-->
  <!--    </v-toolbar-title>-->
  <!--  </v-toolbar>-->

  <!--  <v-card-->
  <!--    class="visitor-card"-->
  <!--    :class="{ 'v-card__loader&#45;&#45;hidden': !isLoading }"-->
  <!--    :disabled="isLoading"-->
  <!--    :loading="isLoading"-->
  <!--  >-->
  <!--    <template #loader="{ isActive }">-->
  <!--      <v-progress-circular-->
  <!--        v-if="isActive"-->
  <!--        :active="isActive"-->
  <!--        :size="70"-->
  <!--        color="amber"-->
  <!--        indeterminate-->
  <!--      />-->
  <!--    </template>-->
  <!--    <v-card-title></v-card-title>-->
  <!--    <v-card-text> </v-card-text>-->
  <!--  </v-card>-->
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
