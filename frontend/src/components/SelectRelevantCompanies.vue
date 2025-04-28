<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ComputedRef, onBeforeUnmount, onMounted, Ref, ref, watch } from 'vue'
import { RelevantSurveyMetrics } from '@/types/SurveyMetrics'
import { CompanyWithSurveys } from '@/../../server/types/api'
import { transformSurveyData } from '@/utils/transformData'
import { useUser } from '@/use/useUser'
import CompanySelector from '@/components/companySelector.vue'

const { t } = useI18n()
const { isLoadingSelectedCompanies, selectedCompaniesList, isLoadingSaveSelectedCompanies, saveRelevantCompanies } =
  useUser()

const props = defineProps({
  data: {
    type: Object as () => Record<string, CompanyWithSurveys>,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

interface CompanyWithSurveysAndAvgKPIs {
  id: string
  name: string
  avgKPIs: RelevantSurveyMetrics
  surveysList: RelevantSurveyMetrics[]
}

const companiesList: ComputedRef<CompanyWithSurveysAndAvgKPIs[]> = computed(() => {
  return Object.values(props.data)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((company: CompanyWithSurveys) => {
      return {
        ...company,
        avgKPIs: transformSurveyData(company.surveysList),
      }
    })
})

const selectedCompaniesMap: Ref<Record<string, boolean>> = ref({})
const selectAll = ref(true)

watch(
  () => selectedCompaniesList.value,
  () => {
    const totalSelected = Object.values(selectedCompaniesList.value)?.length

    if (totalSelected === 0) {
      selectedCompaniesMap.value = companiesList.value.reduce((acc, company) => {
        acc[company.id] = company.surveysList.length > 0
        return acc
      }, {})
    } else {
      selectedCompaniesMap.value = Object.values(selectedCompaniesList.value).reduce(
        (acc, company): Record<string, boolean> => {
          acc[company.id] = true
          return acc
        },
        {}
      )
    }
  },
  { immediate: true }
)

watch(selectAll, newValue => {
  companiesList.value.forEach(company => {
    selectedCompaniesMap.value[company.id] = newValue
  })
})

const toggleSelectCompany = (companyId: string) => {
  selectedCompaniesMap.value[companyId] = !selectedCompaniesMap.value[companyId]
}

const onSave = () => {
  saveRelevantCompanies(
    Object.entries(selectedCompaniesMap.value)
      ?.filter(([, isSelected]) => isSelected)
      .map(([companyId]) => {
        const companyData = props.data[companyId]
        return {
          id: companyData.id,
          name: companyData.name,
        }
      }) || []
  )
}

const sortKey = ref<string | null>(null)
const sortDesc = ref(false)

const sortedCompanies = computed(() => {
  if (!sortKey.value) {
    return companiesList.value
  }

  return [...companiesList.value].sort((a, b) => {
    let comparison = 0

    if (sortKey.value === 'name') {
      comparison = a.name.localeCompare(b.name)
    } else if (sortKey.value === 'transparencyRate') {
      comparison = (a.avgKPIs?.transparencyRate || 0) - (b.avgKPIs?.transparencyRate || 0)
    } else if (sortKey.value === 'participants') {
      comparison = (a.avgKPIs?.participants || 0) - (b.avgKPIs?.participants || 0)
    } else if (sortKey.value === 'totalFeedForwards') {
      comparison = (a.avgKPIs?.totalFeedForwards || 0) - (b.avgKPIs?.totalFeedForwards || 0)
    } else if (sortKey.value === 'surveys') {
      comparison = a.surveysList.length - b.surveysList.length
    }

    return sortDesc.value ? -comparison : comparison
  })
})

watch(sortedCompanies, () => {
  checkSaveButtonVisibility()
})

const handleSort = (key: string) => {
  if (sortKey.value === key) {
    sortDesc.value = !sortDesc.value
  } else {
    sortKey.value = key
    sortDesc.value = false
  }
}

interface HeaderItem {
  title: string
  key: string
  customClasses?: Record<string, boolean>
  sortable?: boolean
}

const headers = computed<HeaderItem[]>(() => [
  { title: '', key: 'select', customClasses: { 'w-12': true } },
  { title: t('companyName'), key: 'name', customClasses: { 'w-1/2': true }, sortable: true },
  { title: t('transparencyRate'), key: 'transparencyRate', customClasses: { 'text-end': true }, sortable: true },
  { title: t('participants'), key: 'participants', customClasses: { 'text-end': true }, sortable: true },
  { title: t('totalFeedForwards'), key: 'totalFeedForwards', customClasses: { 'text-end': true }, sortable: true },
  { title: t('surveys'), key: 'surveys', customClasses: { 'text-end': true }, sortable: true },
])

/* floating save button */
const showFloatingSave = ref(false)
const mainSaveButtonVisible = ref(true)
function checkSaveButtonVisibility() {
  const saveButton = document.getElementById('main-save-btn')
  if (!saveButton) {
    showFloatingSave.value = true
    mainSaveButtonVisible.value = false
    return
  }

  const rect = saveButton.getBoundingClientRect()
  mainSaveButtonVisible.value = rect.bottom > 0 && rect.top < window.innerHeight
  showFloatingSave.value = !mainSaveButtonVisible.value
}

const handleScroll = () => {
  checkSaveButtonVisibility()
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleScroll)
  // Initial check
  setTimeout(() => {
    checkSaveButtonVisibility()
  }, 500)
  setTimeout(() => {
    checkSaveButtonVisibility()
  }, 2000)
  checkSaveButtonVisibility()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleScroll)
})
</script>

<template>
  <v-toolbar
    color="surface"
    elevation="1"
    height="66"
  >
    <template #title>
      <h2 class="text-h5 p-2 font-weight-bold">{{ t('selectRelevantCompanies') }}</h2>
    </template>
  </v-toolbar>

  <v-row
    class="px-3 py-6 mb-6 gap-4 justify-between"
    v-if="companiesList.length"
  >
    <v-card
      class="basis-[100%] sm:basis-[49%] md:basis-[31%] xl:basis-[23%] flex-grow"
      :class="{ 'v-card__loader--hidden': !isLoading }"
      :disabled="isLoading"
      :loading="isLoading"
    >
      <v-card-text>
        <v-table>
          <thead>
            <tr>
              <th
                v-for="header in headers"
                :key="header.key"
                class="cursor-pointer"
                :class="header?.customClasses"
                @click="header.sortable && handleSort(header.key)"
              >
                <div class="flex justify-center items-center">
                  <v-icon
                    v-if="sortKey === header.key"
                    class="inline-block"
                    size="small"
                  >
                    {{ sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
                  </v-icon>
                  <span class="!font-bold !text-[1.25rem]"> {{ header.title }}</span>
                  <v-checkbox
                    v-if="header.key === 'select'"
                    v-model="selectAll"
                    hide-details
                    class="!m-0"
                  ></v-checkbox>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="company in sortedCompanies"
              :key="company.id"
              class="cursor-pointer"
              @click="toggleSelectCompany(company.id)"
            >
              <td>
                <v-checkbox
                  v-model="selectedCompaniesMap[company.id]"
                  hide-details
                  class="!m-0"
                ></v-checkbox>
              </td>
              <td>{{ company.name }}</td>
              <td class="text-end">{{ company.avgKPIs?.transparencyRate || 0 }}%</td>
              <td class="text-end">{{ company.avgKPIs?.participants || 0 }}</td>
              <td class="text-end">{{ company.avgKPIs?.totalFeedForwards || 0 }}</td>
              <td class="text-end">{{ company.surveysList.length }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
      <v-card-actions class="!p-4 !pt-0 justify-end">
        <v-btn
          id="main-save-btn"
          variant="elevated"
          :loading="isLoadingSaveSelectedCompanies || isLoadingSelectedCompanies"
          :disabled="isLoadingSaveSelectedCompanies || isLoadingSelectedCompanies"
          color="primary"
          size="large"
          append-icon="mdi-content-save"
          @click="onSave"
          >{{ t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-row>

  <div
    class="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-40"
    :class="{ 'translate-y-0': showFloatingSave, 'translate-y-full': !showFloatingSave }"
    style="transition: transform 0.3s ease-in-out"
  >
    <div class="container mx-auto py-4 px-6 flex justify-end">
      <v-btn
        id="floating-save-btn"
        variant="elevated"
        :loading="isLoadingSaveSelectedCompanies || isLoadingSelectedCompanies"
        :disabled="isLoadingSaveSelectedCompanies || isLoadingSelectedCompanies"
        color="primary"
        size="large"
        append-icon="mdi-content-save"
        @click="onSave"
      >
        {{ t('save') }}
      </v-btn>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.v-card :deep(.v-selection-control__input)
  margin-left: -16px
</style>

<i18n>
en:
  selectRelevantCompanies: "Select relevant companies"
  noCompaniesSelected: "No companies selected"
  selectedCompanies: "Selected companies:"
  surveys: "#Surveys"
  companyName: "Company Name"
  totalFeedForwards: "#Feed Forwards"
  participants: "#Participants"
  save: "Save"
de:
  selectRelevantCompanies: "Relevante Unternehmen auswählen"
  noCompaniesSelected: "Keine Unternehmen ausgewählt"
  selectedCompanies: "Ausgewählte Unternehmen:"
  surveys: "#Umfragen"
  companyName: "Firmenname"
  totalFeedForwards: "#Feed Forwards"
  participants: "#Teilnehmer"
  save: "Speichern"
</i18n>
