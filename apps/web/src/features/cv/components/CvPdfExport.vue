<script setup lang="ts">
import { shallowRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Locale } from '@portfolio/contracts';
import { Button } from '@/components/ui/button';
const { t, locale } = useI18n({ useScope: 'global' });
const selectedLanguage = shallowRef<Locale>(locale.value as Locale);
watch(locale, value => { selectedLanguage.value = value as Locale; });
</script>
<template>
  <div class="pdf-export">
    <label for="pdf-language" class="sr-only">{{ t('pdf.language') }}</label>
    <div class="pdf-actions">
      <Button as="a" :href="`/api/cv/pdf?lang=${selectedLanguage}`" :download="`cv-${selectedLanguage}.pdf`" variant="outline" class="pdf-button">{{ t('pdf.download') }}</Button>
      <select class="pdf-language-control" id="pdf-language" v-model="selectedLanguage"><option value="fr">Français</option><option value="en">English</option><option value="ko">한국어</option></select>
    </div>
  </div>
</template>
<style scoped>
.pdf-language-control { display: none; }
:global(.js-enabled .pdf-language-control) { display: block; }
.pdf-export { display: grid; gap: .25rem; }
label { font-size: .75rem; color: var(--muted-foreground); }
.pdf-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
select, .pdf-button { min-block-size: 2.75rem; padding: .5rem .75rem; border: 1px solid var(--border); border-radius: .3rem; background: transparent; font-size: .85rem; }
.pdf-button { color: white; background: var(--portfolio-accent); border-color: var(--portfolio-accent); block-size: auto; white-space: normal; }
select { border-color: transparent; padding-inline: .4rem; color: var(--portfolio-accent); cursor: pointer; }
select:hover { background: #e8f0f2; }
select:focus-visible { outline: 2px solid var(--portfolio-accent); outline-offset: 3px; }
@media print { .pdf-export { display: none; } }
</style>
