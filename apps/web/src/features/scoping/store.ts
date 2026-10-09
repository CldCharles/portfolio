import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import type { Locale } from '@portfolio/contracts';
import { runChecks } from './checks';
import { exampleScoping } from './example';
import { emptyScoping, isEmpty, MAX_ITEMS, newId, parseScoping, STORAGE_KEY, type OpenItemKind, type Priority, type Scoping } from './model';

export const STEP_COUNT = 6;
export type View = 'intro' | 'steps' | 'note';

// The workshop state stays in the browser (local storage), never on the server.
export const useScopingStore = defineStore('scoping', () => {
  const scoping = ref<Scoping>(emptyScoping());
  const view = ref<View>('intro');
  const step = ref(1);
  let storageReady = false;

  function restore() {
    if (storageReady || typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? parseScoping(JSON.parse(stored)) : null;
      if (parsed && !isEmpty(parsed)) scoping.value = parsed;
    } catch { /* Storage disabled or corrupted: start from an empty scoping. */ }
    storageReady = true;
  }
  // Declared with the store (not in restore) so saving outlives the page component.
  // Nothing is written before restore, so the server and the first render never touch storage.
  watch(scoping, value => {
    if (!storageReady) return;
    try {
      if (isEmpty(value)) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch { /* Optional: the workshop still works without storage. */ }
  }, { deep: true });

  const checks = computed(() => runChecks(scoping.value));
  const hasContent = computed(() => !isEmpty(scoping.value));

  function open(target: View, targetStep = step.value) {
    view.value = target;
    step.value = Math.min(Math.max(targetStep, 1), STEP_COUNT);
  }
  function start() { open('steps', 1); }
  function loadExample(locale: Locale) { scoping.value = exampleScoping(locale); open('note'); }
  function reset() { scoping.value = emptyScoping(); open('intro', 1); }

  const canAdd = (items: unknown[]) => items.length < MAX_ITEMS;
  function addPersona() { if (canAdd(scoping.value.personas)) scoping.value.personas.push({ id: newId(), name: '', needs: '' }); }
  function removePersona(id: string) {
    scoping.value.personas = scoping.value.personas.filter(persona => persona.id !== id);
    for (const story of scoping.value.stories) if (story.personaId === id) story.personaId = '';
  }
  function addGoal() { if (canAdd(scoping.value.goals)) scoping.value.goals.push({ id: newId(), goal: '', indicator: '', target: '' }); }
  function removeGoal(id: string) { scoping.value.goals = scoping.value.goals.filter(goal => goal.id !== id); }
  function addStory(story: { personaId: string; want: string; benefit: string; priority: Priority }) {
    if (!story.want.trim() || !canAdd(scoping.value.stories)) return false;
    const personaId = scoping.value.personas.some(persona => persona.id === story.personaId) ? story.personaId : '';
    scoping.value.stories.push({ id: newId(), ...story, personaId, want: story.want.trim(), benefit: story.benefit.trim() });
    return true;
  }
  function removeStory(id: string) { scoping.value.stories = scoping.value.stories.filter(story => story.id !== id); }
  function addOpenItem(kind: OpenItemKind) { if (canAdd(scoping.value.openItems)) scoping.value.openItems.push({ id: newId(), kind, text: '' }); }
  function removeOpenItem(id: string) { scoping.value.openItems = scoping.value.openItems.filter(item => item.id !== id); }

  return { scoping, view, step, checks, hasContent, restore, open, start, loadExample, reset, addPersona, removePersona, addGoal, removeGoal, addStory, removeStory, addOpenItem, removeOpenItem };
});
