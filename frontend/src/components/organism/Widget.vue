<script setup lang="ts">
import { ref, Ref } from 'vue'

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

let storedKpiPrintHideList = localStorage.getItem('showPrintHide')
storedKpiPrintHideList = storedKpiPrintHideList ? JSON.parse(storedKpiPrintHideList) : null

const kpiPrintMap: Ref<Map<string, boolean>> = ref(new Map())
if (storedKpiPrintHideList.length) {
  console.log('storedKpiPrintHideList: ', storedKpiPrintHideList)
  storedKpiPrintHideList?.forEach(([kpi, value]: [string, boolean]) => {
    kpiPrintMap.value.set(kpi, value)
  })
}

const togglePrintHide = (kpi: string) => {
  kpiPrintMap.value.set(kpi, !kpiPrintMap.value.get(kpi))
  const greyedOutKpisList = Array.from(kpiPrintMap.value.entries()).filter(([kpi, value]) => value)

  localStorage.setItem('showPrintHide', JSON.stringify(greyedOutKpisList))
}
</script>

<template>
  <v-card
    :key="kpi"
    class="basis-[100%] sm:basis-[49%] md:basis-[49%] xl:basis-[31%] flex-grow"
    :class="{
      'v-card__loader--hidden': !isLoading,
      [`card-${kpi}`]: true,
      'card--greyed-out': !!kpiPrintMap.get(kpi),
    }"
    :disabled="isLoading"
    :loading="isLoading"
  >
    <template #title>
      <v-fab
        class="ms-4 absolute mt-6 mr-1 z-100 opacity-100 hover:opacity-100"
        icon="mdi-plus"
        location="top end"
        size="small"
        absolute
        offset
        @click="togglePrintHide(kpi)"
      ></v-fab>
    </template>
    <v-card-text>
      <slot></slot>
    </v-card-text>
  </v-card>
</template>

<style scoped lang="sass"></style>
