<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue';
import { descriptionBlocks } from '../lib/presentation';
import { featuredExperienceId } from '../lib/visual-presentation';
import type { CvEntry } from '@portfolio/contracts';
import { useI18n } from 'vue-i18n';
defineProps<{ id: string; title: string; entries: CvEntry[] }>();
const { t, locale } = useI18n({ useScope: 'global' });
function formatDate(value: string) {
  if (value.length === 4) return value;
  return new Intl.DateTimeFormat(locale.value, { year: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(value));
}
const isDated = (entry: CvEntry) => entry.kind === 'experience' || entry.kind === 'education';
const isFeatured = (entry: CvEntry) => entry.kind === 'experience' && entry.id === featuredExperienceId;
</script>

<template>
  <section v-if="entries.length" :id="id" class="cv-section" :aria-labelledby="`${id}-title`">
    <h2 :id="`${id}-title`" class="section-title">{{ title }}</h2>
    <div class="entries" :class="`entries-${entries[0]!.kind}`">
      <article v-for="entry in entries" :key="entry.id" class="entry"
        :class="{ 'dated-entry': isDated(entry), 'featured-entry': isFeatured(entry), card: !isDated(entry) }">
        <p v-if="isDated(entry) && (entry.startDate || entry.endDate)" class="dates">
          <template v-if="entry.startDate"><time :datetime="entry.startDate">{{ formatDate(entry.startDate) }}</time> — </template>
          <span v-else>{{ t('cv.ended') }} : </span>
          <time v-if="entry.endDate" :datetime="entry.endDate">{{ formatDate(entry.endDate) }}</time>
          <span v-else class="date-segment">{{ t('cv.present') }}</span>
        </p>
        <span v-if="isDated(entry)" class="rail" aria-hidden="true"><span class="dot"></span></span>
        <div class="entry-content">
          <p v-if="entry.text.fallback" class="fallback-note">{{ t('cv.fallback') }}</p>
          <div :lang="entry.text.locale">
            <template v-if="isDated(entry)">
              <p v-if="entry.text.subtitle" class="entry-company">{{ entry.text.subtitle }}</p>
              <h3 class="entry-title">{{ entry.text.title }}</h3>
            </template>
            <template v-else-if="entry.kind === 'project'">
              <p v-if="entry.text.subtitle" class="entry-eyebrow">{{ entry.text.subtitle }}</p>
              <h3 class="project-title">{{ entry.text.title }}</h3>
            </template>
            <template v-else>
              <h3 class="card-title">{{ entry.text.title }}</h3>
              <p v-if="entry.text.subtitle" class="card-subtitle">{{ entry.text.subtitle }}</p>
            </template>
            <div v-if="entry.text.description" class="entry-description">
              <template v-for="(block, index) in descriptionBlocks(entry.text.description)" :key="index">
                <p v-if="block.kind === 'paragraph'">{{ block.texts[0] }}</p>
                <ul v-else class="contributions">
                  <li v-for="(bullet, bulletIndex) in block.texts" :key="bulletIndex">{{ bullet }}</li>
                </ul>
              </template>
            </div>
          </div>
          <ul v-if="entry.tags.length" class="tags" :aria-label="t('cv.technologies')">
            <li v-for="tag in entry.tags" :key="tag" class="tag">{{ tag }}</li>
          </ul>
          <a v-if="entry.url" :href="entry.url" class="project-link">{{ t('cv.viewProject') }} <ArrowUpRight :size="15" aria-hidden="true" /><span class="sr-only"> — {{ entry.text.title }}</span></a>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.cv-section { padding-block: 3.5rem .5rem; scroll-margin-block-start: 1.5rem; }
.cv-section + .cv-section { border-block-start: 1px solid var(--border); }
.section-title { margin-block-end: 1.75rem; font-family: var(--font-serif); font-size: 2.25rem; font-weight: 500; line-height: 1.1; letter-spacing: -.02em; }
.entries { display: grid; }
.entry { min-inline-size: 0; }
.entry-content { min-inline-size: 0; }

/* Timeline: experience and education */
.dated-entry { display: grid; grid-template-columns: 8rem 1.5rem minmax(0, 1fr); column-gap: .75rem; padding-block-end: 2rem; }
.dates { grid-column: 1; padding-block-start: .3rem; color: var(--portfolio-ink-mute); font-size: .8125rem; line-height: 1.5; font-variant-numeric: tabular-nums; }
.dates time, .date-segment { white-space: nowrap; }
.rail { grid-column: 2; grid-row: 1; position: relative; display: flex; justify-content: center; }
.rail::before { content: ''; position: absolute; inset-block: 0 -2rem; inline-size: 1px; background: var(--border); }
.dated-entry:last-child .rail::before { inset-block-end: auto; block-size: .875rem; }
.dot { position: relative; margin-block-start: .5625rem; inline-size: .6875rem; block-size: .6875rem; border-radius: 50%; background: var(--background); border: 2px solid var(--portfolio-accent-line); }
.dated-entry .entry-content { grid-column: 3; grid-row: 1; }
.featured-entry .dot { background: var(--portfolio-accent); border-color: var(--portfolio-accent); box-shadow: 0 0 0 4px var(--portfolio-accent-soft); }
.featured-entry .entry-content { padding: 1.375rem 1.5rem; background: var(--card); border: 1px solid var(--border); border-radius: .875rem; box-shadow: var(--portfolio-shadow); }
.entry-company { font-size: 1.0625rem; font-weight: 600; line-height: 1.5; letter-spacing: -.01em; }
.entry-title { margin-block-start: .125rem; color: var(--portfolio-accent); font-size: .9375rem; font-weight: 500; line-height: 1.5; }
.entry-description { margin-block-start: .75rem; color: var(--muted-foreground); font-size: .9375rem; line-height: 1.7; max-inline-size: 68ch; white-space: pre-line; }
.entry-description > * + p { margin-block-start: .6rem; }
.contributions { margin-block-start: .75rem; padding-inline-start: 1.125rem; list-style: disc; white-space: normal; }
.contributions li + li { margin-block-start: .375rem; }
.contributions li::marker { color: var(--portfolio-accent-line); }
.tags { display: flex; flex-wrap: wrap; gap: .375rem; margin-block-start: 1rem; list-style: none; }
.tag { padding: .1875rem .625rem; color: var(--portfolio-accent); background: var(--portfolio-accent-soft); border-radius: 999px; font-size: .75rem; font-weight: 500; }

/* Cards: projects, skills, languages */
.card { padding: 1.25rem 1.375rem; background: var(--card); border: 1px solid var(--border); border-radius: .875rem; box-shadow: var(--portfolio-shadow); }
.entries-project, .entries-skill, .entries-language { gap: 1rem; padding-block-end: 2rem; }
.entries-skill { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.entries-language { grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr)); }
.entries-project .card { padding: 1.75rem; }
.entry-eyebrow { color: var(--portfolio-ink-mute); font-size: .75rem; font-weight: 600; letter-spacing: .04em; }
.project-title { margin-block-start: .375rem; font-family: var(--font-serif); font-size: 1.625rem; font-weight: 500; line-height: 1.2; letter-spacing: -.015em; }
.card-title { font-size: 1rem; font-weight: 600; line-height: 1.5; }
.card-subtitle { margin-block-start: .125rem; color: var(--portfolio-accent); font-size: .875rem; font-weight: 500; }
.card .entry-description { margin-block-start: .375rem; font-size: .90625rem; line-height: 1.6; }
.entries-skill .tags, .entries-language .tags { margin-block-start: .75rem; }
.project-link { display: inline-flex; align-items: center; gap: .375rem; min-block-size: 2.75rem; margin-block-start: .5rem; color: var(--portfolio-accent); font-size: .875rem; font-weight: 600; }
.project-link:hover { text-decoration: underline; text-underline-offset: .25rem; }

@media (max-width: 640px) {
  .cv-section { padding-block-start: 2.5rem; }
  .section-title { font-size: 1.875rem; margin-block-end: 1.25rem; }
  .dated-entry { grid-template-columns: 1rem minmax(0, 1fr); }
  .dates { grid-column: 2; grid-row: 1; padding: 0 0 .25rem; }
  .rail { grid-column: 1; grid-row: 1 / span 2; }
  .dated-entry .entry-content { grid-column: 2; grid-row: 2; }
  .featured-entry .entry-content { padding: 1.125rem; }
  .entries-skill { grid-template-columns: minmax(0, 1fr); }
  .entries-project .card { padding: 1.25rem; }
}
@media print {
  .card, .featured-entry .entry-content { box-shadow: none; }
}
</style>
