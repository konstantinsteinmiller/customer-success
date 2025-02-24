<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <v-container>
    <v-toolbar>
      <v-toolbar-title class="text-3xl text-red-400 font-bold">Customer Success</v-toolbar-title>
      <v-spacer />
      <v-btn icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card>
      <v-card-title>{{ t('hello') }} </v-card-title>
      <v-card-text>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus animi asperiores autem commodi consectetur
        cum facere id, iure, nesciunt nobis pariatur quasi sequi, voluptatem! Accusamus, dolores quis. Eum, omnis,
        voluptatem?
      </v-card-text>
      <v-card-actions>
        <v-btn
          theme="dark"
          color="primary"
        >
          {{ t('yesRemove') }}
        </v-btn>
        <v-btn variant="text">
          {{ t('cancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<style lang="sass" scoped></style>

<i18n>
en:
  yesRemove: Yes Remove
  cancel: Cancel
de:
  yesRemove: Ja, entfernen
  cancel: Abbrechen
</i18n>
