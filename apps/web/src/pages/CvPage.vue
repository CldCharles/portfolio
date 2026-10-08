<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { EntryKind, Locale } from '@portfolio/contracts';
import { useCvStore } from '@/features/cv/stores/cv';
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
const sections = computed(() => {
  const definitions: { id: string; kind: EntryKind; title: string; introduction?: string }[] = [
    { id: 'experience', kind: 'experience', title: t('cv.experience') },
    { id: 'projects', kind: 'project', title: t('cv.projects') },
    { id: 'skills', kind: 'skill', title: t('cv.skills') },
    { id: 'education', kind: 'education', title: t('cv.education') },
  ];
  return definitions.map(section => ({ ...section, entries: store.cv?.entries.filter(entry => entry.kind === section.kind) ?? [] })).filter(section => section.entries.length);
});
</script>

<template>
  <div class="portfolio-shell">
    <a href="#main" class="skip-link">{{ t('nav.skip') }}</a>
    <header class="site-header">
      <a class="monogram" href="#main" :aria-label="store.cv?.profile.name ?? t('nav.home')">CCV<span>.</span></a>
      <LanguageSwitcher />
    </header>
    <div class="cv-layout">
    <CvNavigation :sections="sections" />
    <main id="main" tabindex="-1" :aria-busy="store.loading">
      <div v-if="store.loading" class="status-panel" role="status">{{ t('cv.loading') }}</div>
      <div v-else-if="store.failed" class="status-panel" role="alert">
        <p>{{ t('cv.error') }}</p>
        <Button type="button" class="retry" @click="store.load(locale as Locale)">{{ t('cv.retry') }}</Button>
      </div>
      <template v-else-if="store.cv">
        <CvHero :profile="store.cv.profile" exportable />
        <CvSection v-for="(section, index) in sections" :key="section.id" v-bind="section" :number="String(index + 1).padStart(2, '0')" />
      </template>
    </main>
    </div>

  </div>
</template>

<style scoped>
.portfolio-shell { max-inline-size: 1120px; margin-inline: auto; padding-inline: clamp(1.25rem, 5vw, 4rem); }
.site-header { display: flex; flex-wrap: wrap; align-items: center; gap: 1.5rem; border-block-end: 1px solid var(--border); padding-block: 1.5rem; }
.monogram { font-weight: 700; font-size: 1.35rem; letter-spacing: -.06em; margin-inline-end: auto; min-block-size: 2.75rem; display: flex; align-items: center; }
.monogram span { color: var(--portfolio-accent); }
.cv-layout { display: grid; grid-template-columns: 10rem minmax(0, 1fr); gap: 2.5rem; align-items: start; }
.cv-layout > main { min-inline-size: 0; grid-column: 2; }
.status-panel { padding-block: 7rem; text-align: center; }
.retry { margin-block-start: 1.5rem; min-block-size: 2.75rem; }
.skip-link { position: absolute; inset-block-start: -10rem; padding: 1rem; background: var(--foreground); color: var(--background); z-index: 10; }
.skip-link:focus { inset-block-start: 1rem; }
@media print { .cv-layout { display: block; } }
@media (max-width: 900px) { .cv-layout { grid-template-columns: minmax(0, 1fr); gap: 0; } .cv-layout > main { grid-column: 1; } }
</style>
