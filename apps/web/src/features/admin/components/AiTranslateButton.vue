<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Sparkles } from '@lucide/vue';
import type { DraftItem, TranslationTarget } from '@portfolio/contracts';
import { Button } from '@/components/ui/button';
import { errorCode, useTranslationStore } from '../translation';
// Proposes a translation of one section with Claude. Hidden while no API key is configured.
const props = defineProps<{ item: DraftItem; target: TranslationTarget }>();
const { t, te } = useI18n({ useScope: 'global' });
const ai = useTranslationStore();
const message = shallowRef<{ role: 'status' | 'alert'; text: string } | null>(null);
const sourceMissing = computed(() => !props.item.translations.fr.text.title.trim());
const existing = computed(() => {
  const text = props.item.translations[props.target]?.text;
  return !!text && Object.values(text).some(value => value.trim());
});
// The component is reused from one language tab to the other: forget the previous message.
watch(() => props.target, () => { message.value = null; });

async function propose() {
  // A proposal replaces the current text: ask first when there is something to lose.
  if (existing.value && !window.confirm(t('admin.ai.replaceConfirm'))) return;
  message.value = null;
  try {
    await ai.run([{ itemId: props.item.id, target: props.target }]);
    message.value = { role: 'status', text: t('admin.ai.proposed') };
  } catch (error) {
    const code = errorCode(error);
    message.value = { role: 'alert', text: t(te(`admin.errors.${code}`) ? `admin.errors.${code}` : 'admin.errors.UNKNOWN') };
  }
}
</script>

<template>
  <div v-if="ai.status.available" class="ai-translate">
    <Button type="button" variant="outline" class="admin-button" :disabled="ai.busy || sourceMissing || ai.status.remainingToday === 0" @click="propose">
      <Sparkles :size="16" aria-hidden="true" />{{ t(ai.busy ? 'admin.ai.translating' : 'admin.ai.translate') }}
    </Button>
    <p class="muted hint">{{ t(sourceMissing ? 'admin.ai.sourceMissing' : 'admin.ai.hint') }}</p>
    <p v-if="message" :role="message.role" :class="message.role === 'alert' ? 'error-message' : 'notice'">{{ message.text }}</p>
  </div>
</template>

<style scoped>
.ai-translate { display: grid; justify-items: start; gap: .5rem; }
.ai-translate .admin-button { gap: .5rem; }
.hint { margin: 0; font-size: .82rem; }
.ai-translate :where(.error-message, .notice) { margin: 0; justify-self: stretch; }
</style>
