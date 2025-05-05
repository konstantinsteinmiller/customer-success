<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { VSelect } from 'vuetify/components'
import { Company } from '@/../../server/src/types/api'

const props = defineProps<{
  companies: Company[] // List of available companies with an id and name
  modelValue: Company // Currently selected company object
}>()

const { t } = useI18n()

const emit = defineEmits<{
  (event: 'update:modelValue', value: Company): void
}>()

const selectedCompany = ref<Company>(props.modelValue.value)

const companiesList = computed(() => {
  return props.companies.map((company: Company) => {
    return {
      id: company.id,
      name: company.name,
    }
  })
})

// Watch for changes in the selected company and emit the update
watch(
  () => props.modelValue,
  (newValue: Company) => {
    if (typeof newValue === 'string') {
      selectedCompany.value = props.companies.find(company => company.id === newValue)
    }
    selectedCompany.value = newValue
  },
  { immediate: true }
)
watch(selectedCompany, (newValue: Company) => {
  let company = newValue.value || newValue
  if (typeof company === 'string') {
    company = props.companies.find(company => company.id === newValue)
  }
  emit('update:modelValue', company)
})
</script>

<template>
  <div class="w-60 h-9 self-center justify-self-center">
    <v-select
      v-model="selectedCompany"
      :items="companiesList"
      :label="t('selectCompany')"
      density="compact"
      open-text="open dropdown"
      close-text="close dropdown"
      item-title="name"
      item-value="id"
      variant="outlined"
      class="w-full"
    />
  </div>
</template>

<style scoped lang="sass"></style>

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
