<script setup lang="ts">
import { RouterView } from 'vue-router'
import { auth } from '@/api/auth.ts'

const logout = () => {
  auth
    .logout({
      url: '',
      makeRequest: true,
      redirect: { name: 'login' },
    })
    .then(() => {
      console.log('logged out')
    })
}
</script>

<template>
  <header>
    <v-container>
      <v-row>
        <img
          class="min-w-16 w-32"
          src="/joineer.png"
          alt="joineer-log"
        />
        <v-spacer />
        <v-btn
          @click="logout"
          append-icon="mdi-logout"
          >Logout</v-btn
        >
      </v-row>
    </v-container>
  </header>
  <RouterView />
</template>
