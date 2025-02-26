import '@/assets/tailwind.css'
import '@/assets/main.sass'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/App.vue'
import router from '@/router'
import { setupVuetify } from '@/utils/setupVuetify'
import { i18n } from '@/utils/setupI18n'
import { useAuth } from '@/use/auth.ts'
import { configureAxios } from '@/api/config.ts'

configureAxios()

const vuetify = setupVuetify()
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(vuetify)

const auth = useAuth()
auth.loadAccessToken()

app.mount('#app')
