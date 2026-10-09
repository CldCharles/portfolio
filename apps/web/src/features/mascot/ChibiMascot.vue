<script setup lang="ts">
// Chibi version of the site owner. Decorative only: callers give any meaning in text.
export type MascotPose = 'idle' | 'wave' | 'thinking' | 'happy' | 'sixseven';
withDefaults(defineProps<{ pose?: MascotPose }>(), { pose: 'idle' });
const skin = '#f1c7a5';
const shirt = '#7a6a5d';
</script>

<template>
  <svg viewBox="0 0 200 240" class="chibi" aria-hidden="true" focusable="false">
    <g :class="{ bob: pose !== 'sixseven' }">
      <rect x="81" y="182" width="16" height="30" rx="6" fill="#2f3a40" />
      <rect x="103" y="182" width="16" height="30" rx="6" fill="#2f3a40" />
      <ellipse cx="87" cy="213" rx="13" ry="6" fill="#1e2529" />
      <ellipse cx="113" cy="213" rx="13" ry="6" fill="#1e2529" />
      <path d="M68 152 Q100 144 132 152 Q129 170 128 184 Q100 188 72 184 Q71 170 68 152 Z" :fill="shirt" />
      <rect x="92" y="136" width="16" height="16" rx="4" fill="#e3b593" />
      <path d="M86 148 L100 164 L93 147 Z M114 148 L100 164 L107 147 Z" fill="#94857a" />
      <path d="M100 163 L100 176" stroke="#5f5248" stroke-width="2" />
      <circle cx="100" cy="168" r="1.8" fill="#5f5248" />
      <circle cx="100" cy="174" r="1.8" fill="#5f5248" />

      <template v-if="pose === 'sixseven'">
        <g class="six">
          <path d="M70 158 Q52 166 42 156" :stroke="skin" stroke-width="10" stroke-linecap="round" fill="none" />
          <ellipse cx="36" cy="151" rx="11" ry="4.5" :fill="skin" />
          <text x="26" y="136" class="number">6</text>
        </g>
        <g class="seven">
          <path d="M130 158 Q148 166 158 156" :stroke="skin" stroke-width="10" stroke-linecap="round" fill="none" />
          <ellipse cx="164" cy="151" rx="11" ry="4.5" :fill="skin" />
          <text x="158" y="136" class="number">7</text>
        </g>
      </template>
      <template v-else>
        <path d="M70 158 Q58 176 62 192" :stroke="skin" stroke-width="10" stroke-linecap="round" fill="none" />
        <circle cx="62" cy="195" r="7" :fill="skin" />
      </template>

      <ellipse cx="39" cy="98" rx="9" ry="12" fill="#e9bc99" />
      <ellipse cx="161" cy="98" rx="9" ry="12" fill="#e9bc99" />
      <ellipse cx="100" cy="94" rx="61" ry="57" :fill="skin" />
      <path d="M40 96 Q34 52 66 38 Q78 22 100 28 Q120 20 134 34 Q162 44 162 96 Q156 76 148 70 Q144 58 132 62 Q126 48 112 56 Q104 44 92 54 Q82 44 74 58 Q62 52 58 68 Q46 72 40 96 Z" fill="#8d6646" />
      <path d="M84 34 L90 16 L100 30 Z M104 28 L118 14 L120 34 Z M70 42 L68 26 L82 36 Z" fill="#8d6646" />

      <path v-if="pose === 'thinking'" d="M64 81 Q77 76 90 81 M110 74 Q123 63 136 72" class="brows" />
      <path v-else-if="pose === 'sixseven'" d="M64 76 Q77 68 90 76 M110 76 Q123 68 136 76" class="brows" />
      <path v-else d="M64 80 Q77 72 90 79 M110 79 Q123 72 136 80" class="brows" />

      <path v-if="pose === 'happy'" d="M70 99 Q78 88 86 99 M114 99 Q122 88 130 99" stroke="#3a2618" stroke-width="4.5" stroke-linecap="round" fill="none" />
      <g v-else-if="pose === 'thinking'" class="blink">
        <ellipse cx="78" cy="98" rx="8" ry="9" fill="#3a2618" />
        <ellipse cx="122" cy="96" rx="9" ry="11" fill="#3a2618" />
        <circle cx="80" cy="95" r="2.6" fill="#fff" />
        <circle cx="125" cy="92" r="3.2" fill="#fff" />
      </g>
      <g v-else class="blink">
        <ellipse cx="78" cy="97" rx="9" ry="11" fill="#3a2618" />
        <ellipse cx="122" cy="97" rx="9" ry="11" fill="#3a2618" />
        <circle cx="81" cy="93" r="3.2" fill="#fff" />
        <circle cx="125" cy="93" r="3.2" fill="#fff" />
        <circle cx="75" cy="101" r="1.5" fill="#fff" />
        <circle cx="119" cy="101" r="1.5" fill="#fff" />
      </g>

      <path d="M100 104 Q104 110 99 113" stroke="#c99a7c" stroke-width="2" stroke-linecap="round" fill="none" />
      <template v-if="pose !== 'thinking'">
        <ellipse cx="64" cy="116" rx="8" ry="4" fill="#e8a08a" :opacity="pose === 'happy' ? .6 : .45" />
        <ellipse cx="136" cy="116" rx="8" ry="4" fill="#e8a08a" :opacity="pose === 'happy' ? .6 : .45" />
      </template>

      <path v-if="pose === 'idle'" d="M90 123 Q100 131 110 123" stroke="#7a3b2e" stroke-width="3" stroke-linecap="round" fill="none" />
      <path v-else-if="pose === 'wave'" d="M89 121 Q100 134 111 121 Z" fill="#7a3b2e" />
      <path v-else-if="pose === 'thinking'" d="M91 126 Q99 121 109 125" stroke="#7a3b2e" stroke-width="3" stroke-linecap="round" fill="none" />
      <path v-else-if="pose === 'happy'" d="M87 120 Q100 136 113 120 Z" fill="#7a3b2e" />
      <ellipse v-else cx="100" cy="125" rx="6" ry="7" fill="#7a3b2e" />

      <template v-if="pose === 'idle'">
        <path d="M130 158 Q142 176 138 192" :stroke="skin" stroke-width="10" stroke-linecap="round" fill="none" />
        <circle cx="138" cy="195" r="7" :fill="skin" />
      </template>
      <g v-else-if="pose === 'wave'" class="wave">
        <path d="M130 158 Q150 146 154 120" :stroke="skin" stroke-width="10" stroke-linecap="round" fill="none" />
        <circle cx="155" cy="113" r="8" :fill="skin" />
        <path d="M170 100 Q176 108 172 118 M178 94 Q186 106 180 120" class="accent-line" />
      </g>
      <template v-else-if="pose === 'thinking'">
        <path d="M130 158 Q134 142 120 140" :stroke="skin" stroke-width="10" stroke-linecap="round" fill="none" />
        <circle cx="115" cy="139" r="7.5" :fill="skin" />
        <text x="160" y="52" class="number question">?</text>
      </template>
      <template v-else-if="pose === 'happy'">
        <path d="M130 158 Q150 164 157 150" :stroke="skin" stroke-width="10" stroke-linecap="round" fill="none" />
        <rect x="150" y="134" width="16" height="16" rx="5" :fill="skin" />
        <rect x="154" y="120" width="6.5" height="17" rx="3.25" :fill="skin" />
        <path d="M178 112 L180 118 L186 120 L180 122 L178 128 L176 122 L170 120 L176 118 Z" fill="var(--portfolio-accent, #1f5566)" />
      </template>

      <path d="M70 150 Q62 156 61 167 L73 170 Q75 160 78 153 Z" :fill="shirt" />
      <path d="M130 150 Q138 156 139 167 L127 170 Q125 160 122 153 Z" :fill="shirt" />
      <path d="M61 167 L73 170 M139 167 L127 170" stroke="#5f5248" stroke-width="2" stroke-linecap="round" />
    </g>
  </svg>
</template>

<style scoped>
.chibi { display: block; overflow: visible; }
.brows { stroke: #5c4231; stroke-width: 5; stroke-linecap: round; fill: none; }
.number { font-family: var(--font-serif); font-size: 26px; font-weight: 500; fill: var(--portfolio-accent, #1f5566); }
.question { font-size: 36px; }
.accent-line { stroke: var(--portfolio-accent, #1f5566); stroke-width: 2.5; stroke-linecap: round; fill: none; }
.blink { animation: blink 4.2s infinite; transform-box: fill-box; transform-origin: center; }
.bob { animation: bob 3.2s ease-in-out infinite; }
.wave { animation: wave 1.1s ease-in-out infinite; transform-box: view-box; transform-origin: 130px 158px; }
/* Each arm pivots on its shoulder, so it stays attached while the hands go up and down. */
.six { animation: six .34s ease-in-out infinite alternate; transform-box: view-box; transform-origin: 70px 158px; }
.seven { animation: seven .34s ease-in-out infinite alternate -.34s; transform-box: view-box; transform-origin: 130px 158px; }
@keyframes blink { 0%, 93%, 100% { transform: scaleY(1); } 96% { transform: scaleY(.08); } }
@keyframes bob { 50% { transform: translateY(-4px); } }
@keyframes wave { 50% { transform: rotate(-14deg); } }
@keyframes six { from { transform: rotate(-10deg); } to { transform: rotate(16deg); } }
@keyframes seven { from { transform: rotate(10deg); } to { transform: rotate(-16deg); } }
@media (prefers-reduced-motion: reduce) { .blink, .bob, .wave, .six, .seven { animation: none; } }
@media print { .chibi { display: none; } }
</style>
