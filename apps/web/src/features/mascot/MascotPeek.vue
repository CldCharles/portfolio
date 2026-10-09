<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ChibiMascot from './ChibiMascot.vue';
// The mascot peeks over the footer once the visitor reaches the end of the page.
const { t } = useI18n({ useScope: 'global' });
const root = ref<HTMLElement | null>(null);
const visible = ref(false);
const hover = ref(false);
const playing = ref(false);
const pose = computed(() => playing.value ? 'sixseven' : hover.value ? 'wave' : 'idle');
let observer: IntersectionObserver | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;
function play() {
  clearTimeout(timer);
  playing.value = true;
  timer = setTimeout(() => { playing.value = false; }, 2600);
}
onMounted(() => {
  if (!root.value || typeof IntersectionObserver === 'undefined') { visible.value = true; return; }
  observer = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting) return;
    visible.value = true;
    observer?.disconnect();
  }, { threshold: .5 });
  observer.observe(root.value);
});
onUnmounted(() => { observer?.disconnect(); clearTimeout(timer); });
</script>

<template>
  <div ref="root" class="mascot-peek" :class="{ visible }">
    <p class="bubble" aria-hidden="true">{{ t('mascot.thanks') }}</p>
    <button type="button" class="window" :class="{ playing }" :aria-label="t('mascot.surprise')" @click="play"
      @mouseenter="hover = true" @mouseleave="hover = false" @focus="hover = true" @blur="hover = false">
      <ChibiMascot :pose="pose" class="figure" />
    </button>
  </div>
</template>

<style scoped>
.mascot-peek { position: absolute; inset-block-end: 100%; inset-inline-end: 1rem; display: flex; align-items: flex-start; gap: .4rem; pointer-events: none; }
.window { pointer-events: auto; position: relative; inline-size: 112px; block-size: 94px; padding: 0; border: 0; background: none; cursor: pointer; border-radius: 56px 56px 0 0;
  /* Only the bottom is cut: the mascot looks like it stands behind the footer line. */
  clip-path: inset(-200% -100% 0 -100%); }
/* Inside the button: the bottom clip would hide an outer ring. */
.window:focus-visible { outline: 2px solid var(--portfolio-accent); outline-offset: -2px; }
.figure { inline-size: 112px; block-size: auto; transform: translateY(100%); transition: transform .5s cubic-bezier(.2, .9, .3, 1.2); }
.visible .figure { transform: translateY(0); }
/* Rises during the 6-7 so both hands show above the line. */
.visible .playing .figure { transform: translateY(-24%); }
.bubble { margin: 0; max-inline-size: 12rem; padding: .45rem .7rem; border-radius: .8rem .8rem .15rem .8rem; background: var(--portfolio-accent); color: #fff; font-size: .78rem; font-weight: 500; line-height: 1.35; opacity: 0; transform: translateY(.4rem); transition: opacity .3s .45s, transform .3s .45s; }
.visible .bubble { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { .figure, .bubble { transition: none; } }
@media (max-width: 480px) { .bubble { display: none; } }
@media print { .mascot-peek { display: none; } }
</style>
