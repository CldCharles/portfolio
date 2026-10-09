<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ArrowRight, TriangleAlert } from '@lucide/vue';
import type { Locale } from '@portfolio/contracts';
import { useScopingStore } from '../store';
import { stepKeys } from '../steps';
const { t, locale } = useI18n({ useScope: 'global' });
const store = useScopingStore();
</script>

<template>
  <div class="intro">
    <section class="hero">
      <div class="hero-text">
        <p class="eyebrow">{{ t('scoping.intro.eyebrow') }}</p>
        <h1 class="serif" tabindex="-1">{{ t('scoping.intro.heading') }}</h1>
        <p class="lead">{{ t('scoping.intro.lead') }}</p>
        <div class="actions">
          <button v-if="store.hasContent" type="button" class="btn btn-primary" @click="store.open('steps', 1)">
            {{ t('scoping.intro.resume') }}<ArrowRight :size="16" aria-hidden="true" />
          </button>
          <button v-else type="button" class="btn btn-primary" @click="store.start()">
            {{ t('scoping.intro.start') }}<ArrowRight :size="16" aria-hidden="true" />
          </button>
          <button v-if="store.hasContent" type="button" class="btn btn-soft" @click="store.open('note')">{{ t('scoping.actions.seeNote') }}</button>
          <button v-else type="button" class="btn btn-soft" @click="store.loadExample(locale as Locale)">{{ t('scoping.intro.example') }}</button>
        </div>
        <p class="meta muted">{{ t('scoping.intro.meta') }}</p>
      </div>
      <aside class="output" :aria-label="t('scoping.intro.outputTitle')">
        <h2>{{ t('scoping.intro.outputTitle') }}</h2>
        <ol>
          <li v-for="(key, index) in stepKeys" :key="key"><span class="number serif">{{ index + 1 }}</span>{{ t(`scoping.intro.output.${index}`) }}</li>
        </ol>
      </aside>
    </section>

    <section class="steps" aria-labelledby="steps-title">
      <h2 id="steps-title" class="serif">{{ t('scoping.intro.stepsTitle') }}</h2>
      <p class="muted">{{ t('scoping.intro.stepsLead') }}</p>
      <ol>
        <li v-for="(key, index) in stepKeys" :key="key">
          <span class="number serif">{{ index + 1 }}</span>
          <h3>{{ t(`scoping.steps.${key}`) }}</h3>
          <p>{{ t(`scoping.summary.${key}`) }}</p>
        </li>
      </ol>
    </section>

    <section class="analyst" aria-labelledby="analyst-title">
      <div>
        <h2 id="analyst-title" class="serif">{{ t('scoping.intro.analystTitle') }}</h2>
        <p>{{ t('scoping.intro.analystLead') }}</p>
      </div>
      <ul>
        <li v-for="index in 3" :key="index"><TriangleAlert :size="18" aria-hidden="true" class="warning-icon" />{{ t(`scoping.intro.analystExamples.${index - 1}`) }}</li>
      </ul>
    </section>
    <p class="privacy muted">{{ t('scoping.intro.privacy') }}</p>
  </div>
</template>

<style scoped>
.hero { display: flex; flex-wrap: wrap; gap: 3.5rem; align-items: flex-start; }
.hero-text { flex: 999 1 30rem; min-inline-size: 0; }
h1 { margin: 1rem 0 0; font-size: clamp(2.4rem, 6vw, 3.5rem); line-height: 1.05; }
h1:focus { outline: none; }
.lead { margin: 1.5rem 0 0; max-inline-size: 35rem; font-size: 1.12rem; line-height: 1.6; color: var(--muted-foreground); }
.actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-block-start: 2rem; }
.meta { margin: 1rem 0 0; font-size: .82rem; }
.output { flex: 1 1 20rem; min-inline-size: 0; border: 1px solid var(--border); border-radius: 1rem; padding: 1.5rem; background: var(--card); box-shadow: 0 12px 32px -20px rgb(28 42 48 / 35%); }
.output h2 { margin: 0; font-size: .75rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--portfolio-ink-mute); }
.output ol { list-style: none; margin: 1rem 0 0; padding: 0; display: flex; flex-direction: column; gap: .75rem; }
.output li { display: flex; gap: .75rem; align-items: baseline; font-size: .92rem; line-height: 1.45; }
.output .number { flex: none; inline-size: 1.25rem; color: var(--portfolio-accent); font-size: 1.1rem; }
.steps { margin-block-start: 6rem; }
.steps h2, .analyst h2 { margin: 0; font-size: 2rem; }
.steps > p { margin: .5rem 0 0; }
.steps ol { list-style: none; margin: 2rem 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); gap: 1rem; }
.steps li { background: var(--card); box-shadow: var(--portfolio-shadow); border: 1px solid var(--border); border-radius: .9rem; padding: 1.25rem 1.25rem 1.5rem; display: flex; flex-direction: column; gap: .5rem; }
.steps .number { font-size: 1.75rem; line-height: 1; color: var(--portfolio-accent); }
.steps h3 { margin: .25rem 0 0; font-size: 1rem; font-weight: 600; }
.steps li p { margin: 0; font-size: .88rem; line-height: 1.55; color: var(--muted-foreground); }
.analyst { margin-block-start: 4.5rem; display: flex; flex-wrap: wrap; gap: 2.5rem; padding: clamp(1.5rem, 4vw, 2.5rem); border-radius: 1.1rem; background: var(--scoping-sunken); }
.analyst > div { flex: 1 1 18rem; min-inline-size: 0; }
.analyst > div p { margin: .75rem 0 0; line-height: 1.6; color: var(--muted-foreground); }
.analyst ul { flex: 2 1 26rem; min-inline-size: 0; list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: .75rem; }
.analyst li { display: flex; gap: .75rem; align-items: flex-start; background: var(--card); border-radius: .75rem; padding: .9rem 1rem; font-size: .9rem; line-height: 1.5; }
.warning-icon { flex: none; margin-block-start: .1rem; color: #a15c07; }
.privacy { margin: 2rem 0 0; font-size: .85rem; }
</style>
