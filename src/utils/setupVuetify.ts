// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { md } from 'vuetify/iconsets/md'
import colors from 'vuetify/util/colors'

export const setupVuetify = () => {
  return createVuetify({
    components,
    directives,
    defaults: {
      global: {},
      VAutocomplete: {
        variant: 'underlined',
        color: 'primary',
      },
      VDatePicker: {
        variant: 'underlined',
        color: 'primary',
      },
      VSelect: {
        variant: 'underlined',
        color: 'primary',
      },
      VTextField: {
        variant: 'underlined',
        color: 'primary',
      },
    },
    // locale: {
    //   adapter: createVueI18nAdapter({ i18n, useI18n }),
    // },
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
        md,
      },
    },
    theme: {
      // cspNonce: typeof vuetifyValue !== 'undefined' ? vuetifyValue : '',
      themes: {
        light: {
          colors: {
            primary: colors.blue.base, // blue
            //'lighten-6': '#e6f4ff', // light blue
            accentblue: '#d6efff',
            joineer: '#9c2d56', // joineer red
            secondary: '#757575',
            accent: '#2196F3',
            error: '#F44336',
            info: '#FF9800',
            success: '#8BC34A',
            background: '#f3f3f3',
          },
        },
      },
    },
  })
}
