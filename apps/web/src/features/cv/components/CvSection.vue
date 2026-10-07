<script setup lang="ts">
import type { CvEntry } from '@portfolio/contracts';
import { useI18n } from 'vue-i18n';
defineProps<{ id: string; number: string; title: string; introduction?: string; entries: CvEntry[] }>();
const { t, locale } = useI18n({ useScope: 'global' });
function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value, { year: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(value));
}
</script>

<template>
  <section v-if="entries.length" :id="id" class="cv-section" :aria-labelledby="`${id}-title`">
    <div class="section-heading">
      <p class="section-number" aria-hidden="true">{{ number }}</p>
      <div>
        <h2 :id="`${id}-title`" class="section-title">{{ title }}</h2>
        <p v-if="introduction" class="section-intro">{{ introduction }}</p>
      </div>
    </div>
    <div class="entries" :class="{ 'skills-grid': id === 'skills' }">
      <article v-for="entry in entries" :key="entry.id" class="entry">
        <p v-if="entry.text.fallback" class="fallback-note">{{ t('cv.fallback') }}</p>
        <div :lang="entry.text.locale">
          <p class="entry-subtitle">{{ entry.text.subtitle }}</p>
          <h3 class="entry-title">{{ entry.text.title }}</h3>
          <p class="entry-description">{{ entry.text.description }}</p>
        </div>
        <p v-if="entry.startDate" class="dates">
          <time :datetime="entry.startDate">{{ formatDate(entry.startDate) }}</time> —
          <time v-if="entry.endDate" :datetime="entry.endDate">{{ formatDate(entry.endDate) }}</time>
          <span v-else>{{ t('cv.present') }}</span>
        </p>
        <ul v-if="entry.kind !== 'skill' && entry.tags.length" class="tags" :aria-label="t('cv.technologies')">
          <li v-for="tag in entry.tags" :key="tag" class="tag">{{ tag }}</li>
        </ul>
        <a v-if="entry.url" :href="entry.url" class="project-link">{{ t('cv.viewProject') }} <span aria-hidden="true">↗</span><span class="sr-only"> — {{ entry.text.title }}</span></a>
      </article>
    </div>
  </section>
</template>

<style scoped>
.cv-section { border-block-start: 1px solid var(--border); padding-block: 3rem 3.75rem; scroll-margin-block-start: 2rem; }
.section-heading { display: flex; gap: 1.1rem; margin-block-end: 2.5rem; align-items: baseline; }
.section-number { font-size: .7rem; color: var(--portfolio-accent); font-variant-numeric: tabular-nums; }
.section-title { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 500; letter-spacing: -.045em; text-wrap: balance; }
.section-intro { margin-block-start: .65rem; color: var(--muted-foreground); line-height: 1.7; font-size: .95rem; }
.entries { display: grid; gap: 1.5rem; }
.skills-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.entry { background: var(--card); border: 1px solid var(--border); padding: clamp(1.4rem, 3vw, 2.2rem); border-radius: .25rem; }
.entry-subtitle { color: var(--muted-foreground); font-size: .75rem; margin-block-end: .75rem; }
.entry-title { font-size: 1.4rem; font-weight: 500; letter-spacing: -.025em; }
.entry-description { margin-block-start: .8rem; color: var(--muted-foreground); line-height: 1.8; max-inline-size: 66ch; white-space: pre-line; }
.tags { display: flex; flex-wrap: wrap; gap: .5rem; margin-block-start: 1.6rem; list-style: none; }
.tag { padding: .35rem .7rem; font-size: .7rem; border: 1px solid var(--border); border-radius: .25rem; }
.project-link { display: inline-flex; align-items: center; gap: 1rem; min-block-size: 2.75rem; margin-block-start: 1.4rem; font-size: .9rem; text-decoration: underline; text-underline-offset: .3rem; }
.dates { color: var(--muted-foreground); margin-block-start: 1rem; font-size: .85rem; }
@media (max-width: 550px) { .skills-grid { grid-template-columns: 1fr; } }
</style>
