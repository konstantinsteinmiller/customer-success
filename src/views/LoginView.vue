<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { googleSdkLoaded } from 'vue3-google-login'
import axios from 'axios'
import { useAuth } from '@/use/auth.ts'
import { useAuthStore } from '@/stores/authStore.ts'

const { t } = useI18n()
const router = useRouter()

const auth = useAuth()

const loading = ref(false)

const authStore = useAuthStore()
watch(
  () => authStore.isAuthenticated,
  isAuthenticated => {
    if (isAuthenticated) {
      router.push({ path: '/customer-success' })
    }
  }
)
</script>

<template>
  <v-container
    class="fill-height"
    fluid
  >
    <v-row
      align="center"
      justify="center"
      no-gutters
    >
      <v-col
        cols="12"
        sm="10"
        md="8"
        lg="7"
        xl="6"
      >
        <v-card class="pa-4 elevation-12 fade-in">
          <v-card-title>
            {{ t('title') }}
            <span class="pl-1">
              {{ t('withGoogle') }}
            </span>
          </v-card-title>
          <v-card-text>
            <div class="text-grey mb-5">
              {{ t('enterNameAndPassword') }}
            </div>

            <v-row>
              <v-col
                cols="12"
                sm="4"
                md="6"
              >
                <v-img
                  class="slide-in pa-1 d-flex mx-auto"
                  :src="'/images/login-pw.png'"
                  :max-width="$vuetify.display.xs ? 150 : 250"
                ></v-img>
              </v-col>

              <v-col
                cols="12"
                sm="8"
                md="6"
                class="text-center"
              >
                <div>
                  <v-btn
                    :loading="loading"
                    type="outlined"
                    @click="auth.loginWithGoogle"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      aria-hidden="true"
                    >
                      <title>Google</title>
                      <g
                        fill="none"
                        fill-rule="evenodd"
                      >
                        <path
                          fill="#4285F4"
                          d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"
                        ></path>
                        <path
                          fill="#34A853"
                          d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z"
                        ></path>
                        <path
                          fill="#FBBC05"
                          d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573A8.9965 8.9965 0 0 0 0 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z"
                        ></path>
                        <path
                          fill="#EA4335"
                          d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z"
                        ></path>
                      </g></svg
                    >&nbsp;{{ t('signInGoogle') }}
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped lang="sass"></style>

<i18n>
en:
  title: "Login"
  pw: "Password"

  signInGoogle: "Sign in with Google"
  withGoogle: "with Google"
  checkEmail:
     "If you have an account with this e-mail address, your login link will be sent to you now"

  enterNameAndPassword: "Please enter your e-mail and password."
de:
  title: "Login"
  pw: "Passwort"

  signInGoogle: "Anmelden mit Google"
  withGoogle: "mit Google"
  checkEmail:
     "Falls ein Account mit dieser E-Mail-Adresse existiert, wird dir dein Login Link jetzt zugestellt."

  enterNameAndPassword:
     "Bitte gib deine E-Mail-Adresse und dein Passwort jetzt ein."
</i18n>
