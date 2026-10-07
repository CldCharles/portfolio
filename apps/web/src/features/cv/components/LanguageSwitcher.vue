<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Button } from '@/components/ui/button';
import { localeLabels, setLocale, supportedLocales } from '@/i18n';
const { locale, t } = useI18n({ useScope: 'global' });
const shortLabels = { fr: 'FR', en: 'EN', ko: '한국어' };
</script>

<template>
  <div class="language-switcher" role="group" :aria-label="t('nav.language')">
    <Button v-for="language in supportedLocales" :key="language" type="button"
      :variant="locale === language ? 'default' : 'ghost'" class="language-button"
      :aria-pressed="locale === language" :aria-label="localeLabels[language]" :lang="language"
      @click="setLocale(language)">{{ shortLabels[language] }}</Button>
  </div>
</template>

<style scoped>
.language-switcher { display: flex; gap: .25rem; flex-wrap: wrap; }
.language-button { min-block-size: 2.75rem; block-size: auto; padding: .6rem .8rem; border-radius: .3rem; }
</style>
