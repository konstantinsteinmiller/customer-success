import { createI18n } from 'vue-i18n'
import messages from '@/i18n'

export const i18n = createI18n({
  locale: 'de', // set locale
  fallbackLocale: 'en', // set fallback locale
  messages: messages,
  missingWarn: false,
  fallbackWarn: false,
})
