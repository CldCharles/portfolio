<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, shallowRef, watch } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/store';
import LoginForm from '@/features/auth/LoginForm.vue';
import LanguageSwitcher from '@/features/cv/components/LanguageSwitcher.vue';
import AdminNav from '@/features/admin/components/AdminNav.vue';
import { program } from '@/features/learning/program';
import { getFocusWeek } from '@/features/learning/lib/progress';
import { useLearningStore } from '@/features/learning/store';
import { useEditorStore } from '@/features/admin/store';
import LearningStats from '@/features/learning/components/LearningStats.vue';
import WeekTimeline from '@/features/learning/components/WeekTimeline.vue';
import TodayView from '@/features/learning/components/TodayView.vue';
import WeekView from '@/features/learning/components/WeekView.vue';
import OverdueView from '@/features/learning/components/OverdueView.vue';
import ResourceLibrary from '@/features/learning/components/ResourceLibrary.vue';

type View = 'today' | 'week' | 'overdue' | 'resources';
const views: View[] = ['today', 'week', 'overdue', 'resources'];
const { t } = useI18n({ useScope: 'global' });
const auth = useAuthStore();
const store = useLearningStore();
const router = useRouter();
const view = shallowRef<View>('today');
const logoutFailed = shallowRef(false);
const editor = useEditorStore();
const keepNotes = () => store.unsaved.size > 0 && !window.confirm(t('admin.discardConfirm'));
function beforeUnload(event: BeforeUnloadEvent) { if (store.unsaved.size) { event.preventDefault(); event.returnValue = ''; } }
onBeforeRouteLeave(() => !keepNotes());
const week = shallowRef(getFocusWeek(program, store.progress ?? { sessions: {} }).week);
// Once progress is loaded, the Weeks tab opens on the week of the next lesson to do.
watch(() => store.progress, (progress, previous) => { if (progress && !previous) week.value = getFocusWeek(program, progress).week; });

async function open(target: View, targetWeek?: number) {
  if ((target !== view.value || (targetWeek && targetWeek !== week.value)) && keepNotes()) return;
  view.value = target;
  if (targetWeek) week.value = targetWeek;
  await nextTick();
  document.querySelector<HTMLElement>('#learning-view h2')?.focus();
}
// A tab left open overnight must move on to the new day's session.
function refresh() { if (document.visibilityState === 'visible') store.refreshToday(); }
onMounted(() => { document.addEventListener('visibilitychange', refresh); window.addEventListener('beforeunload', beforeUnload); if (!store.progress) void store.load(); });
onUnmounted(() => { document.removeEventListener('visibilitychange', refresh); window.removeEventListener('beforeunload', beforeUnload); });
async function logout() {
  if (keepNotes()) return;
  logoutFailed.value = false;
  // Clear both admin tabs: a later login must reload them, not reuse this session's data.
  try { await auth.logout(); store.clear(); editor.clear(); await router.replace('/admin/login'); }
  catch { logoutFailed.value = true; }
}
</script>

<template>
  <main class="admin-shell">
    <header class="admin-header"><RouterLink to="/">← {{ t('admin.backToSite') }}</RouterLink><div class="admin-actions"><LanguageSwitcher /><Button v-if="auth.session?.authenticated" type="button" variant="outline" class="admin-button" @click="logout">{{ t('admin.logout') }}</Button></div></header>
    <template v-if="auth.session?.authenticated">
      <AdminNav />
      <div class="heading"><p class="admin-eyebrow">{{ t('admin.privateArea') }}</p><h1>{{ t('learning.title') }}</h1><p class="muted">{{ t('learning.intro') }}</p></div>
      <p v-if="logoutFailed" role="alert" class="error-message">{{ t('admin.errors.UNKNOWN') }}</p>
      <p v-if="store.error" role="alert" class="error-message">{{ t('learning.loadFailed') }}</p>
      <p v-if="store.loading" role="status" class="muted">{{ t('learning.loading') }}</p>
      <Button v-else-if="!store.progress" type="button" class="admin-button" @click="store.load">{{ t('learning.retry') }}</Button>
      <div v-if="store.progress" class="learning">
        <LearningStats @overdue="open('overdue')" />
        <nav class="views" :aria-label="t('learning.views.label')">
          <button v-for="item in views" :key="item" type="button" :aria-current="view === item ? 'page' : undefined" @click="open(item)">{{ t(`learning.views.${item}`) }}</button>
        </nav>
        <div id="learning-view" class="view">
          <TodayView v-if="view === 'today'" @select="open('week', $event)" />
          <WeekView v-else-if="view === 'week'" :week="week" @select="open('week', $event)" />
          <OverdueView v-else-if="view === 'overdue'" />
          <ResourceLibrary v-else />
        </div>
        <section class="timeline" aria-labelledby="timeline-heading">
          <h2 id="timeline-heading">{{ t('learning.week.timeline') }}</h2>
          <WeekTimeline :selected="view === 'week' ? week : null" @select="open('week', $event)" />
        </section>
      </div>
    </template>
    <template v-else><p role="alert" class="notice">{{ t('admin.sessionExpired') }}</p><LoginForm @authenticated="store.error = ''; store.load()" /></template>
  </main>
</template>

<style scoped>
.heading { margin-block: 2rem 1.5rem; }
h1 { font-size: clamp(2rem, 4vw, 2.8rem); line-height: 1.2; letter-spacing: -.045em; margin-block: .5rem 1rem; }
.learning { display: grid; gap: 1.8rem; max-inline-size: 960px; }
.views { display: flex; flex-wrap: wrap; gap: .3rem; border-block-end: 1px solid var(--border); }
.views button { min-block-size: 2.75rem; padding: .5rem 1rem; border: 0; border-block-end: 3px solid transparent; background: none; color: var(--muted-foreground); font: inherit; font-weight: 600; cursor: pointer; }
.views button:hover { color: var(--foreground); }
.views button[aria-current] { border-block-end-color: var(--portfolio-accent); color: var(--foreground); }
.timeline { display: grid; gap: .8rem; padding-block-start: 1.5rem; border-block-start: 1px solid var(--border); }
.timeline h2 { margin: 0; font-size: 1.1rem; }
.view :deep(h2) { scroll-margin-block-start: 1rem; }
.view :deep(h2:focus) { outline: none; }
</style>
