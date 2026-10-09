<script setup lang="ts">
import { nextTick, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import LanguageSwitcher from '@/features/cv/components/LanguageSwitcher.vue';
import ScopingIntro from '@/features/scoping/components/ScopingIntro.vue';
import ScopingSteps from '@/features/scoping/components/ScopingSteps.vue';
import ScopingNote from '@/features/scoping/components/ScopingNote.vue';
import { useScopingStore } from '@/features/scoping/store';
const { t, locale } = useI18n({ useScope: 'global' });
const store = useScopingStore();
// Local storage is only read in the browser, after hydration of the server-rendered intro.
onMounted(store.restore);
// Each view or step change moves focus to its heading, so keyboard and screen reader users follow.
watch(() => [store.view, store.step], async () => {
  await nextTick();
  window.scrollTo({ top: 0 });
  document.querySelector<HTMLElement>('#scoping-main h1')?.focus();
});
</script>

<template>
  <div class="scoping-shell">
    <a href="#scoping-main" class="skip-link">{{ t('nav.skip') }}</a>
    <header class="scoping-header">
      <a :href="`/?lang=${locale}`" class="back">← {{ t('scoping.backToCv') }}</a>
      <LanguageSwitcher />
    </header>
    <main id="scoping-main" tabindex="-1">
      <ScopingIntro v-if="store.view === 'intro'" />
      <ScopingSteps v-else-if="store.view === 'steps'" />
      <ScopingNote v-else />
    </main>
  </div>
</template>

<style scoped>
.scoping-shell { --scoping-sunken: #efede6; --scoping-raised: 0 1px 2px rgb(28 42 48 / 6%), 0 8px 24px -18px rgb(28 42 48 / 30%); max-inline-size: 1180px; margin-inline: auto; padding-inline: clamp(1.25rem, 5vw, 4rem); }
.scoping-header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; padding-block: 1rem; border-block-end: 1px solid var(--border); }
.back { display: inline-flex; align-items: center; min-block-size: 2.75rem; font-size: .9rem; color: var(--portfolio-ink-mute); text-decoration: underline; text-underline-offset: .25rem; }
main { padding-block: clamp(2rem, 6vw, 4.5rem) 4rem; }
main:focus { outline: none; }
.skip-link { position: absolute; inset-block-start: -10rem; padding: 1rem; background: var(--foreground); color: var(--background); z-index: 10; }
.skip-link:focus { inset-block-start: 1rem; }
@media print {
  .scoping-header, .skip-link { display: none; }
  :global(.site-footer) { display: none; }
  .scoping-shell { max-inline-size: none; padding: 0; }
  main { padding: 0; }
}
</style>

<style>
/* Shared by the workshop views. */
.scoping-shell .eyebrow { margin: 0; color: var(--portfolio-accent); font-size: .75rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; }
.scoping-shell .serif { font-family: var(--font-serif); font-weight: 500; letter-spacing: -.01em; }
.scoping-shell .muted { color: var(--portfolio-ink-mute); }
.scoping-shell .btn { display: inline-flex; align-items: center; justify-content: center; gap: .5rem; min-block-size: 3rem; padding-inline: 1.25rem; border-radius: .6rem; border: 1px solid transparent; font: inherit; font-size: .92rem; font-weight: 600; text-decoration: none; cursor: pointer; }
.scoping-shell .btn-primary { background: var(--portfolio-accent); color: #fff; }
.scoping-shell .btn-primary:hover { background: var(--portfolio-accent-strong); }
.scoping-shell .btn-soft { background: var(--portfolio-accent-soft); color: var(--portfolio-accent); }
.scoping-shell .btn-soft:hover { background: var(--portfolio-accent-soft-hover); }
.scoping-shell .btn-outline { background: var(--card); border-color: var(--input); color: var(--foreground); }
.scoping-shell .btn-outline:hover { background: var(--scoping-sunken); }
.scoping-shell .btn-dashed { inline-size: 100%; min-block-size: 2.75rem; border: 1px dashed var(--portfolio-accent); background: var(--card); color: var(--portfolio-accent); }
.scoping-shell .btn-dashed:hover { background: var(--portfolio-accent-soft); }
.scoping-shell .icon-button { display: inline-grid; place-items: center; flex: none; inline-size: 2.75rem; block-size: 2.75rem; border: 0; border-radius: .5rem; background: none; color: var(--portfolio-ink-mute); cursor: pointer; }
.scoping-shell .icon-button:hover { background: var(--scoping-sunken); color: var(--foreground); }
.scoping-shell .field { display: flex; flex-direction: column; gap: .4rem; min-inline-size: 0; font-size: .82rem; font-weight: 600; }
.scoping-shell .field :where(input, textarea, select) { min-block-size: 2.75rem; inline-size: 100%; box-sizing: border-box; border: 1px solid var(--input); border-radius: .5rem; padding: .55rem .75rem; background: var(--card); color: var(--foreground); font: inherit; font-size: 1rem; font-weight: 400; line-height: 1.5; }
.scoping-shell .field textarea { resize: vertical; min-block-size: 6rem; }
.scoping-shell .field :where(input, textarea, select):focus-visible { outline: 2px solid var(--portfolio-accent); outline-offset: 2px; }
.scoping-shell .hint { font-weight: 400; color: var(--portfolio-ink-mute); }
.scoping-shell button:focus-visible, .scoping-shell a:focus-visible { outline: 2px solid var(--portfolio-accent); outline-offset: 3px; }
</style>
