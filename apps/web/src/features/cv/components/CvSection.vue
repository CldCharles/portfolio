<script setup lang="ts">
import { descriptionBlocks } from '../lib/presentation';
import type { CvEntry } from '@portfolio/contracts';
import { useI18n } from 'vue-i18n';
defineProps<{ id: string; number: string; title: string; introduction?: string; entries: CvEntry[] }>();
const { t, locale } = useI18n({ useScope: 'global' });
function formatDate(value: string) {
  if (value.length === 4) return value;
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
      <article v-for="entry in entries" :key="entry.id" class="entry" :class="{ 'dated-entry': entry.kind === 'experience' || entry.kind === 'education' }">
        <p v-if="entry.startDate || entry.endDate" class="dates">
          <template v-if="entry.startDate"><time :datetime="entry.startDate">{{ formatDate(entry.startDate) }}</time> — </template>
          <span v-else>{{ t('cv.ended') }} : </span>
          <time v-if="entry.endDate" :datetime="entry.endDate">{{ formatDate(entry.endDate) }}</time>
          <span v-else>{{ t('cv.present') }}</span>
        </p>
        <div v-if="entry.kind === 'skill'" class="entry-content skill-content">
          <details>
            <summary :lang="entry.text.locale">{{ entry.text.title }}</summary>
            <p v-if="entry.text.fallback" class="fallback-note">{{ t('cv.fallback') }}</p>
            <p class="skill-description" :lang="entry.text.locale">{{ entry.text.description }}</p>
            <a v-if="entry.url" :href="entry.url" class="project-link skill-link">{{ t('cv.viewProject') }} <span aria-hidden="true">↗</span><span class="sr-only"> — {{ entry.text.title }}</span></a>
          </details>
        </div>
        <div v-else class="entry-content">
          <p v-if="entry.text.fallback" class="fallback-note">{{ t('cv.fallback') }}</p>
          <div :lang="entry.text.locale">
            <template v-if="entry.kind === 'experience' || entry.kind === 'education'">
              <p v-if="entry.text.subtitle" class="entry-company">{{ entry.text.subtitle }}</p>
              <h3 class="entry-title">{{ entry.text.title }}</h3>
            </template>
            <template v-else>
              <p v-if="entry.text.subtitle" class="entry-subtitle">{{ entry.text.subtitle }}</p>
              <h3 class="entry-title">{{ entry.text.title }}</h3>
            </template>
            <div class="entry-description">
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
        <a v-if="entry.url" :href="entry.url" class="project-link">{{ t('cv.viewProject') }} <span aria-hidden="true">↗</span><span class="sr-only"> — {{ entry.text.title }}</span></a>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.cv-section { border-block-start: 1px solid var(--border); padding-block: 1.8rem 2.4rem; scroll-margin-block-start: 1.5rem; }
.section-heading { display: flex; flex-direction: column; gap: .5rem; margin-block-end: 1.2rem; }
.section-number { font-size: .65rem; color: var(--portfolio-accent); font-variant-numeric: tabular-nums; letter-spacing: .12em; }
.section-title { font-family: Georgia, 'Times New Roman', serif; font-size: clamp(1.8rem, 3vw, 2.3rem); font-weight: 400; letter-spacing: -.025em; }
.section-intro { margin-block-start: .6rem; color: var(--muted-foreground); line-height: 1.6; }
.entries { display: grid; }
.entry { min-inline-size: 0; padding-block: 1.4rem; border-block-end: 1px solid var(--border); }
.entry:last-child { border-block-end: 0; }
.dated-entry { display: grid; grid-template-columns: 9rem minmax(0, 1fr); gap: 1.5rem; }
.entry-content { min-inline-size: 0; }
.entry-company { font-size: 1rem; font-weight: 650; line-height: 1.5; }
.entry-subtitle { color: var(--muted-foreground); font-size: .8rem; margin-block-end: .45rem; }
.entry-title { font-size: 1.15rem; font-weight: 600; letter-spacing: -.015em; line-height: 1.45; }
.dated-entry .entry-title { margin-block-start: .25rem; color: var(--portfolio-accent); font-size: .95rem; font-weight: 500; }
.entry-description { margin-block-start: .65rem; color: var(--muted-foreground); font-size: .95rem; line-height: 1.75; max-inline-size: 65ch; }
.entry-description > * + p { margin-block-start: .6rem; }
.contributions { margin-block-start: .7rem; padding-inline-start: 1.2rem; list-style: disc; }
.contributions li + li { margin-block-start: .35rem; }
.tags { display: flex; flex-wrap: wrap; gap: .35rem; margin-block-start: 1rem; list-style: none; }
.tag { padding: .25rem .5rem; font-size: .7rem; border: 1px solid var(--border); border-radius: .2rem; }
.project-link { display: inline-flex; align-items: center; gap: .7rem; min-block-size: 2.75rem; margin-block-start: .6rem; font-size: .85rem; color: var(--portfolio-accent); text-decoration: underline; text-underline-offset: .3rem; }
.dates { color: var(--muted-foreground); font-size: .8rem; line-height: 1.7; font-variant-numeric: tabular-nums; padding-block-start: .15rem; }
.dated-entry .entry-content { grid-column: 2; }
.skills-grid { display: flex; flex-wrap: wrap; align-items: start; gap: .6rem; }
.skills-grid .entry { padding: 0; border: 0; max-inline-size: 100%; }
.skill-content details { border: 1px solid var(--border); border-radius: .25rem; }
.skill-content summary { cursor: pointer; padding: .65rem .8rem; font-size: .85rem; min-block-size: 2.75rem; color: var(--portfolio-accent); }
.skill-content summary:focus-visible { outline: 2px solid var(--portfolio-accent); outline-offset: 3px; }
.skill-content details[open] { max-inline-size: 32rem; }
.skill-description { padding: 0 .8rem .8rem; font-size: .85rem; line-height: 1.7; color: var(--muted-foreground); white-space: pre-line; }
.skill-link { margin-inline: .8rem; margin-block: 0 .5rem; }
@media (max-width: 600px) { .dated-entry { grid-template-columns: 1fr; gap: .45rem; } .dated-entry .entry-content { grid-column: 1; } }
</style>
