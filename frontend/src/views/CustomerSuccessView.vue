<script setup lang="ts">
import { Ref, ref } from 'vue'
import { useAnalytics } from '@/use/useAnalytics'
import DateSelector from '@/components/DateSelector.vue'
import ProcessDataDashboard from '@/components/ProcessDataDashboard.vue'
import { useUser } from '@/use/useUser'
import { Company } from '@/../../server/src/types/api'

const { getProcessData, companiesToSurveyMap } = useAnalytics()
const { selectedCompaniesList } = useUser()

const isLoading: Ref<boolean> = ref(false)

const onDateChange = () => fetchData()
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
</script>

<template>
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
        v-if="isActive && isLoading"
        :active="isActive"
        :size="70"
        color="amber"
        indeterminate
      />
    </template>
    <v-card-text>
      <div
        class="h-64"
        v-if="isLoading"
      ></div>
      <v-row
        class="items-center"
        v-show="false"
      >
        <DateSelector @update:model-value="onDateChange" />
      </v-row>
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
  &.v-card__loader--hidden
    height: 0
  &.v-card__loader--hidden :deep(.v-card__loader)
    display: none
    z-index: -1
</style>

<i18n>
en:
  yesRemove: Yes Remove
  cancel: Cancel
  visitors: Visitors
de:
  yesRemove: Ja, entfernen
  cancel: Abbrechen
  visitors: Besucher
</i18n>
