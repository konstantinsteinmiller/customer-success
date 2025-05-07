<script setup lang="ts">
import CompanySelector from '@/components/molecules/CompanySelector.vue'
import { useUser } from '@/use/useUser'
import { useI18n } from 'vue-i18n'
import { isPrinting } from '@/utils/pdf'
import { computed } from 'vue'
const { selectedCompaniesRef, selectedCompany } = useUser()
const { t } = useI18n()

defineProps({
  title: {
    type: String,
    required: true,
  },
  isLoadingChart: {
    type: Boolean,
    default: false,
  },
  showStdDev: {
    type: Boolean,
    default: false,
  },
  onToggleStdDev: {
    type: Function,
    required: true,
  },
})

const timeFrame = computed(() => {
  const currentDate = new Date()
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(currentDate.getFullYear() - 1)

  const currentDateISO = currentDate.toISOString().split('T')[0]
  const oneYearAgoDateISO = oneYearAgo.toISOString().split('T')[0]

  // const currentDate = new Date()
  const month = currentDate.toLocaleString('default', { month: 'long' })
  const year = currentDate.getFullYear()
  const oneYearAgoMonth = oneYearAgo.toLocaleString('default', { month: 'long' })
  const oneYearAgoYear = oneYearAgo.getFullYear()
  return `${oneYearAgoMonth} ${oneYearAgoYear} - ${month} ${year}`
})
</script>

<template>
  <v-card
    class="v-card__loader--hidden"
    :loading="false"
    :disabled="false"
  >
    <v-card-text>
      <div class="flex items-center justify-between gap-4">
        <div class="w-full justify-self-start self-center">
          <h2 class="text-h5 font-weight-bold break-words wrap-break-word">
            {{ t(title, { companyName: selectedCompany?.name, timeFrame: timeFrame }) }}
          </h2>
        </div>
        <div class="flex justify-center items-center">
          <v-btn
            class="show-std-dev py-2"
            :class="{ 'show-std-dev--hidden': isPrinting }"
            variant="elevated"
            color="outline"
            size="large"
            :loading="isLoadingChart"
            :disabled="isLoadingChart"
            @click="onToggleStdDev"
          >
            {{ showStdDev ? t('hide') : t('show') }} {{ t('stdDev') }}
          </v-btn>
        </div>
        <CompanySelector :companies="selectedCompaniesRef" />
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped lang="sass">
.show-std-dev.show-std-dev--hidden
  display: none
</style>

<i18n>
en:
  customerSuccess: "{companyName}'s KPIs"
  comparison: "Survey Comparison for {companyName}"
  yearlyDevelopment: "{timeFrame} for {companyName}"
de:
  customerSuccess: "{companyName}'s KPIs"
  comparison: "Umfrage Vergleich für {companyName}"
  yearlyDevelopment: "{timeFrame} für {companyName}"
</i18n>
