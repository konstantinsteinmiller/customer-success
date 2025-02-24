import '@/assets/tailwind.css'
import '@/assets/main.sass'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/App.vue'
import router from '@/router'
import { setupVuetify } from '@/utils/setupVuetify.ts'
import { i18n } from '@/utils/setupI18n.ts'

const vuetify = setupVuetify()
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(vuetify)

app.mount('#app')
