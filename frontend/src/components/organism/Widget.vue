<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from '@/use/useUser'

const props = defineProps({
  kpi: {
    type: String,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const { kpiPrintMap } = useUser()

let storedKpiPrintHideList = localStorage.getItem('showPrintHide')
storedKpiPrintHideList = storedKpiPrintHideList ? JSON.parse(storedKpiPrintHideList) : null

if (storedKpiPrintHideList?.length) {
  storedKpiPrintHideList?.forEach((kpi: string) => {
    kpiPrintMap.value[kpi] = true
  })
}

const togglePrintHide = (kpi: string) => {
  kpiPrintMap.value[kpi] = !kpiPrintMap.value[kpi]

  const greyedOutKpisList = Object.keys(kpiPrintMap.value)
    .filter((key: string) => kpiPrintMap.value[key])
    .map((key: string) => key)

  localStorage.setItem('showPrintHide', JSON.stringify(greyedOutKpisList))
}
const isGreyedOut = computed(() => {
  return kpiPrintMap.value[props.kpi] === true
})
</script>

<template>
  <v-card
    :key="kpi"
    class="basis-[100%] sm:basis-[49%] md:basis-[49%] xl:basis-[31%] flex-grow"
    :class="{
      'v-card__loader--hidden': !isLoading,
      [`card-${kpi}`]: true,
      'card--greyed-out': isGreyedOut,
    }"
    :disabled="isLoading"
    :loading="isLoading"
  >
    <template #title>
      <div class="flex justify-end items-center relative h-[0px] overflow-visible">
        <v-icon
          class="grey-out-button !px-4 !py-4 absolute top-4 -right-2 rotate-45 !text-[#656565] z-100 hover:cursor-pointer outline-none"
          icon="mdi-plus"
          @click="togglePrintHide(kpi)"
        />
      </div>
    </template>
    <v-card-text>
      <slot></slot>
    </v-card-text>
  </v-card>
</template>

<style scoped lang="sass">
.v-card
  :deep(.v-card-item__content), :deep(.v-card-title)
    overflow: visible
  &.card--greyed-out
    background-color: #f5f5f5
    opacity: 0.4
    //pointer-events: none
  &.card--print-pdf-hidden
    display: none
    z-index: -1
  :deep(i.grey-out-button), :deep(i.grey-out-button:before)
    overflow: visible
  .grey-out-button
    overflow: visible
    &::before
      padding: 2rem
      border-radius: 2rem

.pdf-screen-target--print-pdf
  .grey-out-button, :deep(.grey-out-button)
    display: none
</style>
