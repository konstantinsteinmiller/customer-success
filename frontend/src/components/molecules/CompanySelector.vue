<script setup lang="ts">
import { computed, Ref, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { VSelect } from 'vuetify/components'
import { Company } from 'server/src/types/api'
import { useUser } from '@/use/useUser'
import { isPrinting } from '@/utils/pdf'

const props = defineProps<{
  companies: Company[] // List of available companies with an id and name
}>()

const { selectedCompany } = useUser()
const { t } = useI18n()

const selected: Ref<Company | null> = ref<Company | null>(selectedCompany.value || null)
const companiesList = computed(() => {
  return props.companies.map((company: Company) => {
    return {
      id: company.id,
      name: company.name,
    }
  })
})

// Watch for changes in the selected company and emit the update
watch(selectedCompany, (newValue: Company, oldValue: Company) => {
  if (newValue.id !== oldValue.id) {
    const companyId = newValue.id || newValue
    if (typeof companyId === 'string') {
      selected.value = companyId
    } else {
      selected.value = newValue?.id
    }
  }
})

const onSelectedChange = (companyId: Company) => {
  selectedCompany.value = props.companies.find(company => company.id === companyId)
}
</script>

<template>
  <div class="w-60 h-9 self-center justify-self-center">
    <v-select
      v-model="selected"
      :items="companiesList"
      :label="t('selectCompany')"
      density="compact"
      open-text="open dropdown"
      close-text="close dropdown"
      item-title="name"
      item-value="id"
      variant="outlined"
      class="company-selector w-full"
      :class="{
        'company-selector--print-pdf': isPrinting,
      }"
      @update:modelValue="onSelectedChange"
    />
  </div>
</template>

<style scoped lang="sass">
.company-selector.company-selector--print-pdf
  display: none
</style>

<i18n>
en:
  $vuetify:
    open: 'open'
  selectCompany: 'Select Company'
de:
  $vuetify:
    open: 'open'
  selectCompany: 'Unternehmen auswählen'
</i18n>
