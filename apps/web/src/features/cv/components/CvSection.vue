<script setup lang="ts">
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
</script>

<template>
  <section v-if="entries.length" :id="id" class="cv-section" :aria-labelledby="`${id}-title`">
    <div class="section-heading">
      <h2 :id="`${id}-title`" class="section-title">{{ title }}</h2>
    </div>
    <div class="entries" :class="{ 'skills-grid': id === 'skills' }">
      <article v-for="entry in entries" :key="entry.id" class="entry" :class="{ 'dated-entry': entry.kind === 'experience' || entry.kind === 'education', 'featured-entry': entry.kind === 'experience' && entry.id === featuredExperienceId }">
        <p v-if="entry.startDate || entry.endDate" class="dates">
          <template v-if="entry.startDate"><time :datetime="entry.startDate">{{ formatDate(entry.startDate) }}</time> — </template>
          <span v-else>{{ t('cv.ended') }} : </span>
          <time v-if="entry.endDate" :datetime="entry.endDate">{{ formatDate(entry.endDate) }}</time>
          <span v-else class="date-segment">{{ t('cv.present') }}</span>
        </p>
        <div v-if="entry.kind === 'skill'" class="entry-content skill-content">
          <h3 class="skill-title" :lang="entry.text.locale">{{ entry.text.title }}</h3>
          <p v-if="entry.text.fallback" class="fallback-note">{{ t('cv.fallback') }}</p>
          <p class="skill-description" :lang="entry.text.locale">{{ entry.text.description }}</p>
          <a v-if="entry.url" :href="entry.url" class="project-link">{{ t('cv.viewProject') }} <span aria-hidden="true">↗</span><span class="sr-only"> — {{ entry.text.title }}</span></a>
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
.cv-section { border-block-start: 1px solid var(--border); padding-block: 1.5rem 2rem; scroll-margin-block-start: 1.5rem; }
.section-heading { display: flex; align-items: baseline; gap: .75rem; margin-block-end: 1rem; }
.section-title { font-family: Georgia, 'Times New Roman', serif; font-size: 2rem; font-weight: 400; letter-spacing: -.025em; }
.entries { display: grid; }
.entry { min-inline-size: 0; padding-block: 1rem; border-block-end: 1px solid var(--border); }
.entry:first-child { padding-block-start: 0; }
.entry:last-child { border-block-end: 0; }
.dated-entry { display: grid; grid-template-columns: 9rem minmax(0, 1fr); gap: 1.5rem; }
.entry-content { min-inline-size: 0; }
.entry-company { font-size: 1rem; font-weight: 650; line-height: 1.5; }
.entry-subtitle { color: var(--muted-foreground); font-size: .8rem; margin-block-end: .45rem; }
.entry-title { font-size: 1.15rem; font-weight: 600; letter-spacing: -.015em; line-height: 1.45; }
.dated-entry .entry-title { margin-block-start: .25rem; color: var(--portfolio-accent); font-size: .9375rem; font-weight: 500; }
.entry-description { margin-block-start: .65rem; color: var(--muted-foreground); font-size: .95rem; line-height: 1.75; max-inline-size: 65ch; }
.entry-description > * + p { margin-block-start: .6rem; }
.contributions { margin-block-start: .7rem; padding-inline-start: 1.2rem; list-style: disc; }
.contributions li + li { margin-block-start: .35rem; }
.tags { display: flex; flex-wrap: wrap; gap: .35rem; margin-block-start: 1rem; list-style: none; }
.tag { padding: .25rem .5rem; font-size: .7rem; border: 1px solid var(--border); border-radius: .2rem; }
.project-link { display: inline-flex; align-items: center; gap: .7rem; min-block-size: 2.75rem; margin-block-start: .6rem; font-size: .85rem; color: var(--portfolio-accent); text-decoration: underline; text-underline-offset: .3rem; }
.dates { color: var(--muted-foreground); font-size: .8rem; line-height: 1.7; font-variant-numeric: tabular-nums; padding-block-start: .15rem; }
.dated-entry .entry-content { grid-column: 2; }
.dates time, .date-segment { white-space: nowrap; }
.featured-entry { padding-block: 1.5rem; }
.featured-entry .entry-content { border-inline-start: 2px solid var(--portfolio-accent); padding-inline-start: 1rem; }
.featured-entry .entry-company { font-size: 1.125rem; font-weight: 600; }
.featured-entry .entry-title { font-size: 1rem; font-weight: 500; }
.skills-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem; }
.skills-grid .entry { padding: 0; border: 0; }
.skill-title { font-size: 1rem; font-weight: 600; line-height: 1.5; }
.skill-description { margin-block-start: .5rem; font-size: .9375rem; line-height: 1.6; color: var(--muted-foreground); white-space: pre-line; }
@media (max-width: 600px) { .section-title { font-size: 1.75rem; } .skills-grid { grid-template-columns: minmax(0, 1fr); } .dated-entry { grid-template-columns: 1fr; gap: .45rem; } .dated-entry .entry-content { grid-column: 1; } }
</style>
