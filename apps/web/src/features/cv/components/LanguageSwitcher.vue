<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { Button } from '@/components/ui/button';
import { localeLabels, setLocale, supportedLocales } from '@/i18n';
const { locale, t } = useI18n({ useScope: 'global' });
const route = useRoute();
const shortLabels = { fr: 'FR', en: 'EN', ko: '한국어' };
</script>

<template>
  <div class="language-switcher" role="group" :aria-label="t('nav.language')">
    <Button v-for="language in supportedLocales" :key="language" as="a" :href="`${route.path}?lang=${language}`"
      :variant="locale === language ? 'default' : 'ghost'" class="language-button"
      :aria-current="locale === language ? 'page' : undefined" :aria-label="localeLabels[language]" :lang="language"
      @click.prevent="setLocale(language)">{{ shortLabels[language] }}</Button>
  </div>
</template>

<style scoped>
.language-switcher { display: flex; gap: .25rem; flex-wrap: wrap; }
.language-button { min-block-size: 2.75rem; block-size: auto; padding: .6rem .8rem; border-radius: .3rem; }
</style>
