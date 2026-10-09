<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
const props = defineProps<{ sections: { id: string; title: string }[] }>();
const { t } = useI18n({ useScope: 'global' });
const activeId = ref<string | null>(null);
let frame: number | null = null;
let mounted = false;
function updateActiveSection() {
  frame = null;
  const threshold = Math.min(window.innerHeight * .25, 160);
  let current: string | null = null;
  for (const section of props.sections) {
    const element = document.getElementById(section.id);
    if (element && element.getBoundingClientRect().top <= threshold) current = section.id;
  }
  // Short last sections never reach the threshold: at the page bottom, mark the last one.
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (atBottom && window.scrollY > 0) current = props.sections.at(-1)?.id ?? current;
  activeId.value = current;
}
function scheduleUpdate() {
  if (mounted && frame === null) frame = window.requestAnimationFrame(updateActiveSection);
}
onMounted(() => {
  mounted = true;
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  scheduleUpdate();
});
watch(() => props.sections, scheduleUpdate, { flush: 'post' });
onUnmounted(() => {
  mounted = false;
  window.removeEventListener('scroll', scheduleUpdate);
  window.removeEventListener('resize', scheduleUpdate);
  if (frame !== null) window.cancelAnimationFrame(frame);
});
</script>

<template>
  <nav v-if="sections.length" class="cv-navigation" :aria-label="t('nav.label')">
    <a v-for="section in sections" :key="section.id" :href="`#${section.id}`"
      :aria-current="activeId === section.id ? 'location' : undefined">{{ section.title }}</a>
  </nav>
</template>

<style scoped>
.cv-navigation { position: sticky; inset-block-start: 2rem; margin-block-start: 3.5rem; padding-inline-start: .875rem; border-inline-start: 1px solid var(--border); display: grid; }
.cv-navigation a { position: relative; display: flex; align-items: center; min-block-size: 2.5rem; font-size: .8125rem; line-height: 1.4; color: var(--portfolio-ink-mute); }
.cv-navigation a:hover, .cv-navigation a[aria-current] { color: var(--portfolio-accent); }
.cv-navigation a[aria-current] { font-weight: 600; }
.cv-navigation a[aria-current]::before { content: ''; position: absolute; inset-inline-start: calc(-.875rem - 1px); inset-block: .5rem; inline-size: 2px; border-radius: 2px; background: var(--portfolio-accent); }
@media (max-width: 900px) {
  .cv-navigation {
    inset-block-start: 0; z-index: 2; display: flex; gap: 1.25rem; overflow-x: auto; scrollbar-width: none;
    margin: 0 calc(-1 * var(--shell-gutter)); padding: 0 var(--shell-gutter); border: 0; border-block-end: 1px solid var(--border);
    background: color-mix(in srgb, var(--background) 92%, transparent); backdrop-filter: blur(8px);
  }
  .cv-navigation a { flex: none; min-block-size: 2.75rem; white-space: nowrap; }
  .cv-navigation a[aria-current]::before { inset: auto 0 0; inline-size: auto; block-size: 2px; }
}
@media print { .cv-navigation { display: none; } }
</style>
