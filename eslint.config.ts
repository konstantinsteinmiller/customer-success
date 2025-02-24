import pluginVue from 'eslint-plugin-vue'
import pluginVuetify from 'eslint-plugin-vuetify'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVitest from '@vitest/eslint-plugin'
import pluginCypress from 'eslint-plugin-cypress/flat'
import prettier from 'eslint-plugin-prettier/recommended'
import vueEslintParser from 'vue-eslint-parser'

export default defineConfigWithVueTs(
  // Files to lint
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,ts,mts,tsx,vue}'],
    languageOptions: {
      parser: vueEslintParser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.vue'],
      },
    },
  },
  // Files to ignore
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },
  // Recommended TypeScript rules for Vue
  vueTsConfigs.recommended,
  // Vue flat config (recommended)
  pluginVue.configs['flat/recommended'],
  // Vuetify base rules (flat)
  pluginVuetify.configs['flat/base'],
  // Custom rules
  {
    rules: {
      'vue/html-indent': 'off',
      'vue/attributes-order': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/no-multi-spaces': 'error',
      'no-multi-spaces': ['error', { ignoreEOLComments: false }],
      'vue/html-closing-bracket-newline': ['error', { multiline: 'always', singleline: 'never' }],
      'vue/html-closing-bracket-spacing': ['error', { selfClosingTag: 'always' }],
      'vue/mustache-interpolation-spacing': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/order-in-components': 'off',
      'vue/no-spaces-around-equal-signs-in-attribute': 'off',
      'vue/html-self-closing': 'off',
      'vue/attribute-hyphenation': 'off',
      'vue/v-on-event-hyphenation': 'off',
      'vue/prop-name-casing': ['error', 'camelCase'],
      'vue/component-definition-name-casing': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/v-on-style': 'warn',
      'array-bracket-spacing': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'vue/no-reserved-keys': 'off',
      'vue/require-prop-types': 'off',
      'vue/require-default-prop': 'off',
      'vue/require-explicit-emits': 'off',
      'vue/no-unused-components': 'warn',
      'vue/no-v-html': 'off',
      'vue/no-reserved-component-names': 'warn',
      'vue/no-side-effects-in-computed-properties': 'warn',
      'vue/order-in-components': ['error'],
      'vue/script-indent': ['off', 2, { baseIndent: 0, switchCase: 0 }],
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: 3,
          multiline: 1,
        },
      ],
      'no-else-return': ['error', { allowElseIf: false }],
      curly: 'error',
      'prettier/prettier': [
        'error',
        {
          printWidth: 120,
          singleAttributePerLine: true,
          singleQuote: true,
          semi: false,
          tabWidth: 2,
          trailingComma: 'es5',
          arrowParens: 'avoid',
        },
      ],
    },
  },
  // Vitest configuration
  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },
  // Cypress configuration
  {
    ...pluginCypress.configs.recommended,
    files: ['cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}', 'cypress/support/**/*.{js,ts,jsx,tsx}'],
  },
  prettier
)
