import { createI18n } from 'vue-i18n'
import messages from '@/i18n'

export const i18n = createI18n({
  legacy: false, // you must set `false`, to use Composition API
  locale: 'en', // set locale
  fallbackLocale: 'en', // set fallback locale
  messages: messages,
  missingWarn: false,
  fallbackWarn: false,
})
