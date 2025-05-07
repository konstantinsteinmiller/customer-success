<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocale } from 'vuetify'

const { t, locale } = useI18n()
const { current }: any = useLocale()
current.value = locale

const emit = defineEmits(['update:modelValue'])

const selectedMonth = ref(ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1)))
const formattedMonth = computed(() => {
  const year = selectedMonth.value.getFullYear()
  const monthFormatted = String(selectedMonth.value.getMonth() + 1).padStart(2, '0') // Months are 0-indexed
  return `${year}-${monthFormatted}`
})

const maxDate = ref(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay()))
const isMonthMenuOpen = ref(false)

const getDateRange = computed(() => {
  // Calculate the last day of the previous month
  const firstDayOfNextMonth = new Date(selectedMonth.value.getFullYear(), selectedMonth.value.getMonth() + 1, 1)
  const lastDayOfPreviousMonth = new Date((firstDayOfNextMonth as any) - 1)

  // Format the end date as "YYYY-MM-DD"
  const endDayFormatted = String(lastDayOfPreviousMonth.getDate()).padStart(2, '0')
  const endMonthFormatted = String(lastDayOfPreviousMonth.getMonth() + 1).padStart(2, '0')

  const dayFormatted = String(selectedMonth.value.getDate()).padStart(2, '0')
  return {
    start: `${formattedMonth.value}-${dayFormatted}`,
    end: `${lastDayOfPreviousMonth.getFullYear()}-${endMonthFormatted}-${endDayFormatted}`,
  }
})

const setSelectedDate = (year, month) => {
  selectedMonth.value = new Date(year ?? new Date().getFullYear(), month, 1)
  isMonthMenuOpen.value = false

  emit('update:modelValue', getDateRange.value)
}
const onMonthChange = (month: number) => {
  setSelectedDate(null, month)
}
const onDayChange = (date: any) => {
  setSelectedDate(date.getFullYear(), date.getMonth())
}

/* immediately emit to fetch first data */
emit('update:modelValue', getDateRange.value)
</script>

<template>
  <v-menu
    v-model="isMonthMenuOpen"
    :close-on-content-click="false"
    transition="scale-transition"
  >
    <template #activator="{ props }">
      <v-text-field
        v-model="formattedMonth"
        :label="t('selectMonth')"
        prepend-icon="mdi-calendar"
        readonly
        v-bind="props"
        class="pt-3 pr-4"
        style="margin-bottom: -16px"
      ></v-text-field>
    </template>

    <v-date-picker
      :title="t('selectMonth')"
      v-model="selectedMonth"
      :view-mode="isMonthMenuOpen ? 'months' : null"
      :max="maxDate"
      @input="isMonthMenuOpen = false"
      @update:month="onMonthChange"
      @update:model-value="onDayChange"
    >
    </v-date-picker>
  </v-menu>
</template>

<style scoped lang="sass"></style>

<i18n>
en:
  selectMonth: 'Select Month'
de:
  selectMonth: 'Monat auswählen'
</i18n>
