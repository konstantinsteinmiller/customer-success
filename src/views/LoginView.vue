<script setup lang="ts">
import { useAuth, useUser } from 'vue-auth3'
import { ref } from 'vue'

const auth = useAuth()

const onLogin = async () => {
  try {
    const result = await auth.login({
      data: {
        username: username.value,
        password: password.value,
      },
      redirect: { name: 'customer-success' },
      staySignedIn: true,
      fetchUser: true,
    })
    // Call the login endpoint. vue-auth3 expects a config with URL and data.
    console.log('finished: ', result)
  } catch (err) {
    error.value = 'Login failed. Check your credentials.'
  }
  const user = useUser()

  console.log(user.value)
}

const username = ref('')
const password = ref('')
const error = ref('')
</script>

<template>
  <v-container>
    <v-card
      ><div
        v-if="error"
        class="bg-red mb-3 py-3 px-5"
      >
        {{ error }}
      </div>
      <v-card-title>Login</v-card-title>
      <v-card-text>
        <p v-if="auth.check()">
          {{ auth.user() }}
        </p>
        <p
          v-else
          class="mb-4"
        >
          You are not logged in!
        </p>

        <form @submit.prevent="onLogin">
          <v-text-field
            v-model="username"
            type="text"
            required
            hide-details="auto"
            label="Username"
            color="primary"
            :disabled="false"
            :loading="false"
          />
          <v-text-field
            v-model="password"
            type="password"
            required
            hide-details="auto"
            label="Password"
            color="primary"
            :disabled="false"
            :loading="false"
          />
        </form>
      </v-card-text>
      <v-card-actions>
        <v-btn
          variant="flat"
          append-icon="mdi-login"
          color="primary"
          @click="onLogin"
          >Login</v-btn
        ></v-card-actions
      >
    </v-card>
  </v-container>
</template>

<style scoped lang="sass"></style>
