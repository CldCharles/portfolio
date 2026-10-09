<script setup lang="ts">
import { onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
// Easter egg: two arms come out from behind the portrait and do the "6-7" gesture.
defineProps<{ src: string }>();
const { t } = useI18n({ useScope: 'global' });
const playing = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;
let frame: number | undefined;
function play() {
  clearTimeout(timer);
  if (frame !== undefined) cancelAnimationFrame(frame);
  playing.value = false;
  // Two frames: the browser must render the stopped state once, so a click
  // during the animation restarts it instead of only extending it.
  frame = requestAnimationFrame(() => {
    frame = requestAnimationFrame(() => {
      frame = undefined;
      playing.value = true;
      timer = setTimeout(() => { playing.value = false; }, 2600);
    });
  });
}
onUnmounted(() => {
  clearTimeout(timer);
  if (frame !== undefined) cancelAnimationFrame(frame);
});
</script>

<template>
  <button type="button" class="portrait-button" :class="{ playing }" :aria-label="t('cv.portraitSurprise')" @click="play">
    <span v-for="side in ['left', 'right']" :key="side" class="arm-slot" :class="`arm-${side}`" aria-hidden="true">
      <span class="arm-motion">
        <span class="number">{{ side === 'left' ? '6' : '7' }}</span>
        <svg viewBox="0 0 80 80" class="arm">
          <path d="M0 60 L34 60" class="sleeve" />
          <path d="M34 60 L42 28" class="forearm" />
          <ellipse cx="45" cy="21" rx="15" ry="5" class="hand" />
          <ellipse cx="33" cy="18" rx="5" ry="3" transform="rotate(-35 33 18)" class="hand" />
        </svg>
      </span>
    </span>
    <img :src="src" alt="" class="portrait" width="152" height="152" />
  </button>
</template>

<style scoped>
.portrait-button { position: relative; display: block; padding: 0; border: 0; background: none; border-radius: 1.25rem; cursor: pointer; }
.portrait-button:focus-visible { outline: 2px solid var(--portfolio-accent); outline-offset: 4px; }
.portrait { position: relative; z-index: 1; display: block; inline-size: 152px; block-size: 152px; border-radius: 1.25rem; object-fit: cover; box-shadow: 0 0 0 1px rgb(28 42 48 / 8%), 0 12px 32px -16px rgb(28 42 48 / 35%); }

/* Arms start hidden behind the photo and slide out from its lower corners while playing. */
.arm-slot { position: absolute; z-index: 0; inset-block-end: -24%; inline-size: 72%; aspect-ratio: 1; opacity: 0; pointer-events: none; transition: transform .22s ease-out, opacity .15s; }
.arm-right { inset-inline-start: 86%; transform: translateX(-70%) scale(.6); transform-origin: left bottom; }
.arm-left { inset-inline-end: 86%; transform: translateX(70%) scale(.6); transform-origin: right bottom; }
.playing .arm-slot { opacity: 1; transform: none; }
.arm-motion { display: block; inline-size: 100%; block-size: 100%; transform-origin: 0 75%; }
.arm-left .arm-motion { transform-origin: 100% 75%; }
.playing .arm-motion { animation: six-seven .34s ease-in-out infinite alternate; }
.playing .arm-left .arm-motion { animation-delay: -.34s; }
.arm { display: block; inline-size: 100%; block-size: 100%; overflow: visible; }
.arm-left .arm { transform: scaleX(-1); }
.sleeve { stroke: #59646a; stroke-width: 15; stroke-linecap: round; fill: none; }
.forearm { stroke: #e2b08c; stroke-width: 11; stroke-linecap: round; fill: none; }
.hand { fill: #e2b08c; }
.number { position: absolute; inset-block-start: -30%; inset-inline-start: 42%; color: var(--portfolio-accent); font-family: var(--font-serif); font-size: 1.5rem; font-weight: 600; line-height: 1; opacity: 0; }
.arm-left .number { inset-inline-start: auto; inset-inline-end: 42%; }
.playing .number { animation: number-pop .68s ease-in-out infinite; }
.playing .arm-left .number { animation-delay: -.34s; }
/* Palms up, straight up and down, one hand rising while the other drops: the "6-7" gesture. */
@keyframes six-seven {
  from { transform: translateY(16%); }
  to { transform: translateY(-24%); }
}
@keyframes number-pop {
  0%, 45% { opacity: 0; translate: 0 20%; }
  60%, 80% { opacity: 1; translate: 0 0; }
  100% { opacity: 0; translate: 0 -20%; }
}
@media (prefers-reduced-motion: reduce) {
  .arm-slot { transition: opacity .15s; }
  .playing .arm-motion, .playing .number { animation: none; }
  .playing .number { opacity: 1; }
}
/* Smaller arms where the page gutter is narrower, so the hands are not clipped. */
@media (max-width: 1120px) { .arm-slot { inline-size: 55%; } .arm-right { inset-inline-start: 84%; } .arm-left { inset-inline-end: 84%; } }
@media (min-width: 641px) and (max-width: 900px) { .portrait { inline-size: 120px; block-size: 120px; } .arm-slot { inline-size: 52%; } }
@media (max-width: 640px) { .portrait, .portrait-button { border-radius: .875rem; } .portrait { inline-size: 76px; block-size: 76px; } .arm-slot { inline-size: 46%; } .arm-right { inset-inline-start: 82%; } .arm-left { inset-inline-end: 82%; } .number { font-size: .9rem; } }
@media (max-width: 360px) { .portrait { inline-size: 64px; block-size: 64px; } }
@media print { .arm-slot { display: none; } .portrait-button { cursor: auto; } }
</style>
