<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/use/useAuth.js'
import ToastManager from '@/components/molecules/ToastManager.vue'
import { useI18n } from 'vue-i18n'
import { computed, onMounted, onUnmounted, Ref, ref, shallowRef, watch } from 'vue'
import { useUser } from '@/use/useUser'
import { useAnalytics } from '@/use/useAnalytics'
import { generatePdf } from '@/utils/pdf'

const auth = useAuth()
const router = useRouter()

const { t } = useI18n()

const logout = async () => {
  const success: boolean = await auth.logout()
  if (success) {
    userProfile.value = {}
    router.push({ name: 'login' })
  }
}

const activeButton = ref(-1)
const menuItems = ref([
  {
    id: 0,
    text: t('customerSuccess'),
    icon: 'mdi-poll',
    action: () => router.push({ name: 'customer-success' }),
  },
  {
    id: 1,
    text: t('progress'),
    icon: 'mdi-chart-line',
    action: () => router.push({ name: 'progression' }),
  },
  {
    id: 2,
    text: t('yearDevelopment'),
    icon: 'mdi-chart-timeline',
    action: () => router.push({ name: 'year-development' }),
  },
  {
    id: 3,
    text: t('companiesSelect'),
    icon: 'mdi-domain',
    action: () => router.push({ name: 'companies' }),
  },
  {
    id: 4,
    text: t('visitors'),
    icon: 'mdi-home-analytics',
    action: () => router.push({ name: 'visitors' }),
  },
])
const routeNamesList: string[] = ['customer-success', 'progression', 'year-development', 'companies', 'visitors']

const userItems = ref([
  {
    text: t('logout'),
    icon: 'mdi-logout',
    action: logout,
  },
])

const { userProfile, getUser, selectedCompany } = useUser()
const route = useRoute()
const hasScrolledToBottomOfWindow: Ref<boolean> = ref(false)

const printableRoutesList = ['customer-success', 'progression']
const onScrollPage = () => {
  hasScrolledToBottomOfWindow.value = printableRoutesList.includes(route.name as string)
    ? window.innerHeight + Math.round(window.scrollY) >= document.body.offsetHeight
    : false
}
onMounted(async () => {
  document.addEventListener('scroll', onScrollPage)

  await getUser()
})

onUnmounted(() => {
  document.removeEventListener('scroll', onScrollPage)
})

watch(
  () => route,
  () => {
    const name = route.name
    routeNamesList.findIndex(route => route === name) !== -1
      ? (activeButton.value = routeNamesList.findIndex(route => route === name))
      : (activeButton.value = 0)
  },
  { deep: true }
)

const { areChartsAnimating, isAnimatingMap } = useAnalytics()
const profilePicture = computed(() => userProfile.value?.picture)

const onNavButton = async (item: any) => {
  const interval = setInterval(() => {
    if (!areChartsAnimating.value) {
      clearInterval(interval)
      setTimeout(() => {
        item.action()
      }, 500)
    }
  }, 100)
}

const open = shallowRef(false)
const onPrintClick = () => {
  const isoDate = new Date().toISOString().split('T')[0]
  const companyName = selectedCompany.value?.name.toLowerCase()?.split(' ').join('-')
  generatePdf(`${route.name as string}-${companyName}-${isoDate}.pdf`, '.pdf-screen-target')
}
</script>

<template>
  <v-layout>
    <v-app-bar
      class="px-md-4"
      color="surface-variant"
      flat
    >
      <img
        class="min-w-16 w-32 mr-4 px-2 sm:px-16 md:px-0"
        src="/images/joineer.png"
        alt="joineer-log"
        style="filter: drop-shadow(2px 2px 4px rgba(255, 255, 255, 0.7))"
      />

      <template v-if="$vuetify.display.smAndUp">
        <v-btn
          v-for="(item, i) in menuItems"
          :key="i"
          :active="item.id === activeButton"
          class="me-2 text-none"
          slim
          @click="onNavButton(item)"
        >
          <template #prepend><v-icon :icon="item.icon" /></template>
          {{ item.text }}
        </v-btn>
      </template>

      <v-spacer />

      <template #append>
        <v-btn
          class="ms-1"
          icon
        >
          <v-avatar :image="profilePicture ? profilePicture : '/images/profile.png'" />

          <v-menu
            activator="parent"
            origin="top"
          >
            <v-list>
              <v-list-item
                v-for="(item, i) in userItems"
                :key="i"
                link
                @click="item.action"
              >
                <template #prepend><v-icon :icon="item.icon" /></template>
                <v-list-item-title>{{ item.text }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-btn>
      </template>
    </v-app-bar>

    <v-main style="--v-layout-top: 48px">
      <RouterView />
    </v-main>

    <v-fab
      v-show="hasScrolledToBottomOfWindow"
      :key="'print-pdf-position'"
      :absolute="false"
      :app="true"
      :color="'primary'"
      :location="'bottom right'"
      size="large"
      icon
      @click="onPrintClick"
    >
      <v-icon>{{ open ? 'mdi-close' : 'mdi-file-pdf-box' }}</v-icon>
    </v-fab>
    <ToastManager />
  </v-layout>
</template>

<style lang="sass">

:deep(.v-card__loader)
  display: flex
  justify-content: center
  align-items: center
  height: 100%

.v-card
  &.v-card__loader--hidden :deep(.v-card__loader)
    display: none
    z-index: -1

main
  padding: 0

.v-card.v-card--print-pdf, .pdf-screen-target.pdf-screen-target--print-pdf div.v-toolbar__content
  background-color: rgba(246, 246, 246, 0.89) !important

.pdf-screen-target--print-pdf
  padding: 3.5rem 4rem 2.5rem 4rem
  width: calc(100% + 8rem)
  height: calc(100% + 6rem)
</style>

<i18n>
en:
  customerSuccess: 'Customer Success'
  companiesSelect: 'Companies Select'
  progress: 'Survey Progression'
  yearDevelopment: 'Yearly'
  visitors: 'Webpage Visitors'
  login: 'Login'
  logout: 'Logout'
de:
  customerSuccess: 'Kundenerfolg Dashboard'
  companiesSelect: 'Unternehmen auswählen'
  progress: 'Umfragen Progression'
  yearDevelopment: 'Jährliche Entwicklung'
  visitors: 'Webseite Besucher'
  login: 'Login'
  logout: 'Logout'
</i18n>
