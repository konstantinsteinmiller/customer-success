<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { useAuth } from '@/use/auth.ts'

const auth = useAuth()
const router = useRouter()

const logout = async () => {
  const success: boolean = await auth.logout()
  if (success) {
    router.push({ name: 'login' })
  }
}
</script>

<template>
  <header>
    <v-container>
      <v-row>
        <img
          class="min-w-16 w-32"
          src="/images/joineer.png"
          alt="joineer-log"
        />
        <v-spacer />
        <v-row class="flex gap-4 justify-end">
          <v-btn
            @click="() => router.push({ name: 'login' })"
            append-icon="mdi-logout"
            >To Login</v-btn
          >
          <v-btn
            @click="() => router.push({ name: 'customer-success' })"
            append-icon="mdi-logout"
            >To Customer Success</v-btn
          >
          <v-btn
            @click="logout"
            append-icon="mdi-logout"
            >Logout</v-btn
          >
        </v-row>
      </v-row>
    </v-container>
  </header>
  <RouterView />
</template>
