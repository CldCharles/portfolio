<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { EntryKind, Locale } from '@portfolio/contracts';
import { useCvStore } from '@/features/cv/stores/cv';
import CvHero from '@/features/cv/components/CvHero.vue';
import CvSection from '@/features/cv/components/CvSection.vue';
import LanguageSwitcher from '@/features/cv/components/LanguageSwitcher.vue';
import { Button } from '@/components/ui/button';
const { t, locale } = useI18n({ useScope: 'global' });
const store = useCvStore();
watch(locale, value => { void store.load(value as Locale); }, { immediate: true });
onUnmounted(store.cancel);
const sections = computed(() => {
  const definitions: { id: string; kind: EntryKind; title: string; introduction?: string }[] = [
    { id: 'skills', kind: 'skill', title: t('cv.skills'), introduction: t('cv.skillsIntro') },
    { id: 'projects', kind: 'project', title: t('cv.projects'), introduction: t('cv.projectsIntro') },
    { id: 'experience', kind: 'experience', title: t('cv.experience') },
    { id: 'education', kind: 'education', title: t('cv.education') },
  ];
  return definitions.map(section => ({ ...section, entries: store.cv?.entries.filter(entry => entry.kind === section.kind) ?? [] })).filter(section => section.entries.length);
});
</script>

<template>
  <div class="portfolio-shell">
    <a href="#main" class="skip-link">{{ t('nav.skip') }}</a>
    <header class="site-header">
      <a href="#main" class="monogram" :aria-label="t('nav.home')">CCV<span aria-hidden="true">.</span></a>
      <nav class="section-nav" :aria-label="t('nav.label')">
        <a v-if="sections.some(section => section.id === 'skills')" href="#skills">{{ t('nav.skills') }}</a>
        <a v-if="sections.some(section => section.id === 'projects')" href="#projects">{{ t('nav.projects') }}</a>
      </nav>
      <LanguageSwitcher />
    </header>
    <main id="main" tabindex="-1" :aria-busy="store.loading">
      <div v-if="store.loading" class="status-panel" role="status">{{ t('cv.loading') }}</div>
      <div v-else-if="store.failed" class="status-panel" role="alert">
        <p>{{ t('cv.error') }}</p>
        <Button type="button" class="retry" @click="store.load(locale as Locale)">{{ t('cv.retry') }}</Button>
      </div>
      <template v-else-if="store.cv">
        <CvHero :profile="store.cv.profile" />
        <CvSection v-for="(section, index) in sections" :key="section.id" v-bind="section" :number="String(index + 1).padStart(2, '0')" />
      </template>
    </main>
    <footer class="site-footer">
      <span v-if="store.cv">{{ store.cv.profile.name }}</span>
      <span>{{ t('cv.footer') }}</span>
    </footer>
  </div>
</template>

<style scoped>
.portfolio-shell { max-inline-size: 1160px; margin-inline: auto; padding-inline: clamp(1.25rem, 5vw, 4rem); }
.site-header { display: flex; align-items: center; flex-wrap: wrap; gap: 1.5rem; border-block-end: 1px solid var(--border); padding-block: 1.5rem; }
.monogram { font-weight: 700; font-size: 1.35rem; letter-spacing: -.06em; margin-inline-end: auto; min-block-size: 2.75rem; display: flex; align-items: center; }
.monogram span { color: var(--portfolio-accent); }
.section-nav { display: flex; flex-wrap: wrap; gap: 1.7rem; font-size: .8rem; color: var(--muted-foreground); }
.section-nav a { display: flex; align-items: center; min-block-size: 2.75rem; }
.site-footer { border-block-start: 1px solid var(--border); padding-block: 1.7rem 2.5rem; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1rem; color: var(--muted-foreground); font-size: .75rem; }
.status-panel { padding-block: 7rem; text-align: center; }
.retry { margin-block-start: 1.5rem; min-block-size: 2.75rem; }
.skip-link { position: absolute; inset-block-start: -10rem; padding: 1rem; background: var(--foreground); color: var(--background); z-index: 10; }
.skip-link:focus { inset-block-start: 1rem; }
@media (max-width: 550px) { .section-nav { order: 3; inline-size: 100%; } .site-header { row-gap: .25rem; } }
</style>
