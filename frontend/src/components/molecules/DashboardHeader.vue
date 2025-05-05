<script setup lang="ts">
import CompanySelector from '@/components/companySelector.vue'
import { useUser } from '@/use/useUser'
import { useI18n } from 'vue-i18n'
const { selectedCompaniesRef, selectedCompany } = useUser()
const { t } = useI18n()

const props = defineProps({
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
            {{ t(title, { companyName: selectedCompany?.name }) }}
          </h2>
        </div>
        <div class="flex justify-center items-center">
          <v-btn
            class="py-2"
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
        <CompanySelector
          :companies="selectedCompaniesRef"
          v-model="selectedCompany"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped lang="sass"></style>

<i18n>
en:
  customerSuccess: "{companyName}'s KPIs"
  comparison: "Survey Comparison for {companyName}"
de:
  customerSuccess: "{companyName}'s KPIs"
  comparison: "Umfrage Vergleich für {companyName}"
</i18n>
