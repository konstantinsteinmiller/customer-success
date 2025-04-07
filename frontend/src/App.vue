<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { useAuth } from '@/use/useAuth.js'
import ToastManager from '@/components/molecules/ToastManager.vue'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

const auth = useAuth()
const router = useRouter()

const { t } = useI18n()

const logout = async () => {
  const success: boolean = await auth.logout()
  if (success) {
    router.push({ name: 'login' })
  }
}
const menuItems = ref([
  {
    title: 'customerSuccess',
    icon: 'mdi-poll',
    action: () => router.push({ name: 'customer-success' }),
  },
  {
    title: 'progress',
    icon: 'mdi-chart-line',
    action: () => router.push({ name: 'progression' }),
  },
  {
    title: 'companiesSelect',
    icon: 'mdi-domain',
    action: () => router.push({ name: 'companies' }),
  },
  {
    title: 'visitors',
    icon: 'mdi-home-analytics',
    action: () => router.push({ name: 'visitors' }),
  },
  {
    title: 'logout',
    icon: 'mdi-logout',
    action: logout,
  },
])
</script>

<template>
  <header>
    <v-container class="!max-w-full">
      <v-row class="items-center">
        <img
          class="min-w-16 w-32"
          src="/images/joineer.png"
          alt="joineer-log"
        />
        <v-spacer />
        <v-row class="flex gap-4 justify-end">
          <v-menu>
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-cog"
                variant="text"
              />
            </template>

            <v-list>
              <v-list-item
                v-for="(item, index) in menuItems"
                :key="index"
                @click="item.action"
              >
                <template #prepend><v-icon :icon="item.icon" /></template>
                <v-list-item-title>{{ t(item.title) }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-row>
      </v-row>
    </v-container>
    <ToastManager />
  </header>
  <RouterView />
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
  visitors: 'Webpage Visitors'
  login: 'Login'
  logout: 'Logout'
de:
  customerSuccess: 'Kundenerfolg Dashboard'
  companiesSelect: 'Unternehmen auswählen'
  visitors: 'Webseite Besucher'
  login: 'Login'
  logout: 'Logout'
</i18n>
