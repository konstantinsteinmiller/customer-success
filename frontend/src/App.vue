<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/use/useAuth.js'
import ToastManager from '@/components/molecules/ToastManager.vue'
import { useI18n } from 'vue-i18n'
import { computed, onMounted, ref, watch } from 'vue'
import { useUser } from '@/use/useUser'
import { useAnalytics } from '@/use/useAnalytics'

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
const routeNamesList: string[] = ['customer-success', 'progression', 'companies', 'visitors']
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
    text: t('companiesSelect'),
    icon: 'mdi-domain',
    action: () => router.push({ name: 'companies' }),
  },
  {
    id: 3,
    text: t('visitors'),
    icon: 'mdi-home-analytics',
    action: () => router.push({ name: 'visitors' }),
  },
])

const userItems = ref([
  {
    text: t('logout'),
    icon: 'mdi-logout',
    action: logout,
  },
])

const { userProfile, getUser } = useUser()
const route = useRoute()
onMounted(async () => {
  await getUser()
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
</script>

<template>
  <v-layout>
    <v-app-bar
      class="px-md-4"
      color="surface-variant"
      flat
    >
      <img
        class="min-w-16 w-32 mr-4"
        src="/images/joineer.png"
        alt="joineer-log"
        style="filter: drop-shadow(2px 2px 4px rgba(255, 255, 255, 0.7))"
      />

      <template v-if="$vuetify.display.mdAndUp">
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
                :title="item.text"
                v-bind="item"
                @click="item.action"
              />
            </v-list>
          </v-menu>
        </v-btn>
      </template>
    </v-app-bar>

    <v-main style="--v-layout-top: 48px">
      <RouterView />
    </v-main>
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
</style>

<i18n>
en:
  customerSuccess: 'Customer Success'
  companiesSelect: 'Companies Select'
  progress: 'Survey Progression'
  visitors: 'Webpage Visitors'
  login: 'Login'
  logout: 'Logout'
de:
  customerSuccess: 'Kundenerfolg Dashboard'
  companiesSelect: 'Unternehmen auswählen'
  progress: 'Umfragen Progression'
  visitors: 'Webseite Besucher'
  login: 'Login'
  logout: 'Logout'
</i18n>
