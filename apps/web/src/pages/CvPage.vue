<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Locale } from '@portfolio/contracts';
import { useCvStore } from '@/features/cv/stores/cv';
import { groupSections } from '@/features/cv/lib/sections';
import CvHero from '@/features/cv/components/CvHero.vue';
import CvSection from '@/features/cv/components/CvSection.vue';
import LanguageSwitcher from '@/features/cv/components/LanguageSwitcher.vue';
import CvNavigation from '@/features/cv/components/CvNavigation.vue';
import { Button } from '@/components/ui/button';
const { t, locale } = useI18n({ useScope: 'global' });
const store = useCvStore();
onMounted(() => { if (!store.consumeHydration(locale.value as Locale)) void store.load(locale.value as Locale); });
watch(locale, value => { void store.load(value as Locale); });
onUnmounted(store.cancel);
const sections = computed(() => groupSections(store.cv?.entries ?? [], key => t(key)));
const languages = computed(() => store.cv?.entries.filter(entry => entry.kind === 'language').map(entry => ({ title: entry.text.title, locale: entry.text.locale })) ?? []);
</script>

<template>
  <div class="portfolio-shell">
    <a href="#main" class="skip-link">{{ t('nav.skip') }}</a>
    <header class="site-header">
      <LanguageSwitcher />
    </header>
    <div class="cv-layout" :class="{ 'no-navigation': !sections.length }">
    <CvNavigation :sections="sections" />
    <main id="main" tabindex="-1" :aria-busy="store.loading">
      <div v-if="store.loading && !store.cv" class="status-panel" role="status">{{ t('cv.loading') }}</div>
      <div v-else-if="store.failed" class="status-panel" role="alert">
        <p>{{ t('cv.error') }}</p>
        <Button type="button" class="retry" @click="store.load(locale as Locale)">{{ t('cv.retry') }}</Button>
      </div>
      <template v-else-if="store.cv">
        <CvHero :profile="store.cv.profile" :languages="languages" exportable />
        <CvSection v-for="section in sections" :id="section.id" :key="section.id" :title="section.title" :entries="section.entries" />
      </template>
    </main>
    </div>

  </div>
</template>

<style scoped>
.portfolio-shell { --shell-gutter: clamp(1.25rem, 5vw, 4rem); max-inline-size: 1120px; margin-inline: auto; padding-inline: var(--shell-gutter); }
.site-header { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 1.5rem; border-block-end: 1px solid var(--border); padding-block: 1rem; }
.cv-layout { display: grid; grid-template-columns: 9.5rem minmax(0, 1fr); gap: 3rem; align-items: start; }
.cv-layout > main { min-inline-size: 0; grid-column: 2; }
.cv-layout.no-navigation { grid-template-columns: minmax(0, 1fr); }
.cv-layout.no-navigation > main { grid-column: 1; }
.status-panel { padding-block: 7rem; text-align: center; }
.retry { margin-block-start: 1.5rem; min-block-size: 2.75rem; }
.skip-link { position: absolute; inset-block-start: -10rem; padding: 1rem; background: var(--foreground); color: var(--background); z-index: 10; }
.skip-link:focus { inset-block-start: 1rem; }
@media (max-width: 600px) { .site-header { padding-block: .5rem; } }
@media print { .cv-layout { display: block; } }
@media (max-width: 900px) {
  .cv-layout { grid-template-columns: minmax(0, 1fr); gap: 0; }
  .cv-layout > main { grid-column: 1; }
  /* Keep section titles clear of the sticky table of contents. */
  .cv-layout :deep(.cv-section) { scroll-margin-block-start: 3.5rem; }
}
</style>
