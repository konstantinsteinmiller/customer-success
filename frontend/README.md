# customer-success

includes:
- Vue.js 3.5.x + vuetify + pinia + typescript + tailwindCSS + SASS + i18n + axios + eslint + prettier

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm serve
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
pnpm test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
pnpm test:e2e:dev
```

This runs the end-to-end tests against the Vite development server.
It is much faster than the production build.

But it's still recommended to test the production build with `test:e2e` before deploying (e.g. in CI environments):

```sh
pnpm build
pnpm test:e2e
```
