<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { Sparkles } from '@lucide/vue';
import type { DraftDocument } from '@portfolio/contracts';
import { Button } from '@/components/ui/button';
import { errorCode, missingTranslations, useTranslationStore } from '../translation';
// Proposes every missing English and Korean translation in one go. Existing translations,
// even unreviewed ones, are never overwritten: they may hold manual corrections.
const props = defineProps<{ document: DraftDocument }>();
const { t, te } = useI18n({ useScope: 'global' });
const ai = useTranslationStore();
const jobs = computed(() => missingTranslations(props.document));
const progress = shallowRef('');
const message = shallowRef<{ role: 'status' | 'alert'; text: string } | null>(null);
onMounted(() => { void ai.refreshStatus(); });

async function translateMissing() {
  const pending = jobs.value;
  if (pending.length > ai.status.remainingToday) { message.value = { role: 'alert', text: t('admin.errors.TRANSLATION_QUOTA') }; return; }
  message.value = null;
  let done = 0;
  try {
    await ai.run(pending, count => { done = count; progress.value = t('admin.ai.progress', { done: count, total: pending.length }); });
    message.value = { role: 'status', text: t('admin.ai.batchDone', { count: done }, done) };
  } catch (error) {
    const code = errorCode(error);
    const reason = t(te(`admin.errors.${code}`) ? `admin.errors.${code}` : 'admin.errors.UNKNOWN');
    message.value = { role: 'alert', text: `${t('admin.ai.batchStopped', { count: done }, done)} ${reason}` };
  } finally { progress.value = ''; }
}
</script>

<template>
  <section v-if="ai.status.available" class="ai-missing" :aria-label="t('admin.ai.title')">
    <div class="row">
      <Button type="button" variant="outline" class="admin-button" :disabled="ai.busy || !jobs.length" @click="translateMissing">
        <Sparkles :size="16" aria-hidden="true" />{{ t('admin.ai.translateMissing', { count: jobs.length }, jobs.length) }}
      </Button>
      <span class="muted">{{ t('admin.ai.remaining', { count: ai.status.remainingToday }, ai.status.remainingToday) }}</span>
    </div>
    <p v-if="progress" role="status" class="muted">{{ progress }}</p>
    <p v-if="message" :role="message.role" :class="message.role === 'alert' ? 'error-message' : 'notice'">{{ message.text }}</p>
  </section>
</template>

<style scoped>
.ai-missing { display: grid; gap: .5rem; margin-block-end: 1.5rem; }
.row { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; font-size: .85rem; }
.row .admin-button { gap: .5rem; }
.ai-missing :where(p) { margin: 0; }
</style>
