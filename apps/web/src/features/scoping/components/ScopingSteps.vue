<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ArrowLeft, ArrowRight, Check, Lightbulb, Plus, Trash2 } from '@lucide/vue';
import { openItemKinds, priorities, type Priority } from '../model';
import { STEP_COUNT, useScopingStore } from '../store';
import { stepKeys } from '../steps';
import ScopingChecks from './ScopingChecks.vue';
const { t } = useI18n({ useScope: 'global' });
const store = useScopingStore();
const key = computed(() => stepKeys[store.step - 1]!);
const scoping = computed(() => store.scoping);
const stepChecks = computed(() => store.checks.filter(check => check.step === store.step));
const personaName = (id: string) => scoping.value.personas.find(persona => persona.id === id)?.name.trim() || t('scoping.fields.noPersona');

const draft = reactive({ personaId: '', want: '', benefit: '', priority: 'must' as Priority });
// A profile deleted in step 2 must not stay selected in the story form.
watch(() => scoping.value.personas.map(persona => persona.id), ids => { if (!ids.includes(draft.personaId)) draft.personaId = ''; });

// After a deletion, focus goes back to the step's add control instead of the page body.
const addControl = ref<HTMLElement | HTMLElement[] | null>(null);
async function remove(action: () => void) {
  action();
  await nextTick();
  const target = addControl.value;
  (Array.isArray(target) ? target[0] : target)?.focus();
}
const announcement = ref('');
function addStory() {
  if (!store.addStory({ ...draft })) return;
  draft.want = '';
  draft.benefit = '';
  announcement.value = t('scoping.actions.storyAdded');
}
const storiesBy = (priority: Priority) => scoping.value.stories.filter(story => story.priority === priority);
</script>

<template>
  <div class="steps-view">
    <nav :aria-label="t('scoping.stepsLabel')" class="stepper">
      <ol>
        <li v-for="(stepKey, index) in stepKeys" :key="stepKey">
          <button type="button" :aria-current="store.step === index + 1 ? 'step' : undefined" :class="{ done: index + 1 < store.step }" @click="store.open('steps', index + 1)">
            <span class="dot"><Check v-if="index + 1 < store.step" :size="13" aria-hidden="true" /><template v-else>{{ index + 1 }}</template></span>
            <span class="label">{{ t(`scoping.short.${stepKey}`) }}</span>
          </button>
        </li>
      </ol>
    </nav>

    <div class="layout">
      <div class="content">
        <p class="eyebrow">{{ t('scoping.stepOf', { n: store.step, total: STEP_COUNT }) }} · {{ t(`scoping.steps.${key}`) }}</p>
        <h1 class="serif" tabindex="-1">{{ t(`scoping.question.${key}`) }}</h1>
        <p class="summary">{{ t(`scoping.summary.${key}`) }}</p>

        <div class="form">
          <template v-if="key === 'problem'">
            <label class="field">{{ t('scoping.fields.title') }}
              <input v-model="scoping.title" type="text" maxlength="200" :placeholder="t('scoping.fields.titlePlaceholder')" />
            </label>
            <label class="field">{{ t('scoping.fields.situation') }}
              <textarea v-model="scoping.situation" rows="4" maxlength="2000" :placeholder="t('scoping.fields.situationPlaceholder')" />
            </label>
            <label class="field">{{ t('scoping.fields.costLabel') }}
              <textarea v-model="scoping.cost" rows="3" maxlength="2000" :placeholder="t('scoping.fields.costPlaceholder')" />
            </label>
          </template>

          <template v-else-if="key === 'users'">
            <fieldset v-for="(persona, index) in scoping.personas" :key="persona.id" class="card">
              <legend class="visually-hidden">{{ t('scoping.fields.persona') }} {{ index + 1 }}</legend>
              <div class="card-row">
                <label class="field grow">{{ t('scoping.fields.persona') }}
                  <input v-model="persona.name" type="text" maxlength="120" :placeholder="t('scoping.fields.personaPlaceholder')" />
                </label>
                <button type="button" class="icon-button" :aria-label="t('scoping.actions.removeNamed', { name: persona.name || index + 1 })" @click="remove(() => store.removePersona(persona.id))"><Trash2 :size="18" aria-hidden="true" /></button>
              </div>
              <label class="field">{{ t('scoping.fields.needs') }}
                <textarea v-model="persona.needs" rows="2" maxlength="2000" :placeholder="t('scoping.fields.needsPlaceholder')" />
              </label>
            </fieldset>
            <button ref="addControl" type="button" class="btn btn-dashed" @click="store.addPersona()"><Plus :size="16" aria-hidden="true" />{{ t('scoping.actions.addPersona') }}</button>
          </template>

          <template v-else-if="key === 'goals'">
            <fieldset v-for="(goal, index) in scoping.goals" :key="goal.id" class="card">
              <legend class="visually-hidden">{{ t('scoping.fields.goal') }} {{ index + 1 }}</legend>
              <div class="card-row">
                <label class="field grow">{{ t('scoping.fields.goal') }}
                  <input v-model="goal.goal" type="text" maxlength="200" :placeholder="t('scoping.fields.goalPlaceholder')" />
                </label>
                <button type="button" class="icon-button" :aria-label="t('scoping.actions.removeNamed', { name: goal.goal || index + 1 })" @click="remove(() => store.removeGoal(goal.id))"><Trash2 :size="18" aria-hidden="true" /></button>
              </div>
              <div class="pair">
                <label class="field">{{ t('scoping.fields.indicator') }}
                  <input v-model="goal.indicator" type="text" maxlength="200" :placeholder="t('scoping.fields.indicatorPlaceholder')" />
                </label>
                <label class="field">{{ t('scoping.fields.target') }}
                  <input v-model="goal.target" type="text" maxlength="80" :placeholder="t('scoping.fields.targetPlaceholder')" />
                </label>
              </div>
            </fieldset>
            <button ref="addControl" type="button" class="btn btn-dashed" @click="store.addGoal()"><Plus :size="16" aria-hidden="true" />{{ t('scoping.actions.addGoal') }}</button>
          </template>

          <template v-else-if="key === 'scope'">
            <div class="pair">
              <label class="field">{{ t('scoping.fields.inScope') }} <span class="hint">{{ t('scoping.fields.linesHint') }}</span>
                <textarea v-model="scoping.inScope" rows="6" maxlength="2000" />
              </label>
              <label class="field">{{ t('scoping.fields.outOfScope') }} <span class="hint">{{ t('scoping.fields.linesHint') }}</span>
                <textarea v-model="scoping.outOfScope" rows="6" maxlength="2000" />
              </label>
            </div>
            <label class="field">{{ t('scoping.fields.constraintsLabel') }}
              <textarea v-model="scoping.constraints" rows="3" maxlength="2000" :placeholder="t('scoping.fields.constraintsPlaceholder')" />
            </label>
          </template>

          <template v-else-if="key === 'features'">
            <form class="card story-form" @submit.prevent="addStory">
              <div class="triple">
                <label class="field">{{ t('scoping.fields.asA') }}
                  <select v-model="draft.personaId">
                    <option value="">{{ t('scoping.fields.noPersona') }}</option>
                    <option v-for="persona in scoping.personas.filter(item => item.name.trim())" :key="persona.id" :value="persona.id">{{ persona.name }}</option>
                  </select>
                </label>
                <label class="field">{{ t('scoping.fields.want') }}
                  <input ref="addControl" v-model="draft.want" type="text" required maxlength="300" :placeholder="t('scoping.fields.wantPlaceholder')" />
                </label>
                <label class="field">{{ t('scoping.fields.benefit') }}
                  <input v-model="draft.benefit" type="text" maxlength="300" :placeholder="t('scoping.fields.benefitPlaceholder')" />
                </label>
              </div>
              <div class="story-actions">
                <fieldset class="priorities">
                  <legend>{{ t('scoping.fields.priority') }}</legend>
                  <label v-for="priority in priorities" :key="priority" class="pill" :class="{ selected: draft.priority === priority }">
                    <input v-model="draft.priority" type="radio" name="priority" :value="priority" />{{ t(`scoping.priority.${priority}`) }}
                  </label>
                </fieldset>
                <button type="submit" class="btn btn-primary"><Plus :size="16" aria-hidden="true" />{{ t('scoping.actions.addStory') }}</button>
              </div>
              <p class="visually-hidden" role="status">{{ announcement }}</p>
            </form>

            <div class="board">
              <section v-for="priority in priorities" :key="priority" class="column" :class="priority" :aria-labelledby="`column-${priority}`">
                <h2 :id="`column-${priority}`"><span>{{ t(`scoping.priorityShort.${priority}`) }}</span><span class="muted">{{ t(`scoping.priority.${priority}`) }}</span></h2>
                <article v-for="story in storiesBy(priority)" :key="story.id" class="story">
                  <p class="who">{{ personaName(story.personaId) }}</p>
                  <p class="what">{{ story.want }}</p>
                  <p v-if="story.benefit" class="why">→ {{ story.benefit }}</p>
                  <div class="story-tools">
                    <label class="visually-hidden" :for="`priority-${story.id}`">{{ t('scoping.fields.priority') }} — {{ story.want }}</label>
                    <select :id="`priority-${story.id}`" v-model="story.priority">
                      <option v-for="option in priorities" :key="option" :value="option">{{ t(`scoping.priorityShort.${option}`) }}</option>
                    </select>
                    <button type="button" class="icon-button" :aria-label="t('scoping.actions.removeNamed', { name: story.want })" @click="remove(() => store.removeStory(story.id))"><Trash2 :size="16" aria-hidden="true" /></button>
                  </div>
                </article>
              </section>
            </div>
          </template>

          <template v-else>
            <fieldset v-for="item in scoping.openItems" :key="item.id" class="card">
              <legend class="visually-hidden">{{ t(`scoping.kind.${item.kind}`) }}</legend>
              <div class="card-row">
                <label class="field kind">{{ t('scoping.fields.kind') }}
                  <select v-model="item.kind">
                    <option v-for="kind in openItemKinds" :key="kind" :value="kind">{{ t(`scoping.kind.${kind}`) }}</option>
                  </select>
                </label>
                <label class="field grow">{{ t('scoping.fields.item') }}
                  <textarea v-model="item.text" rows="2" maxlength="2000" />
                </label>
                <button type="button" class="icon-button" :aria-label="t('scoping.actions.removeNamed', { name: item.text || t(`scoping.kind.${item.kind}`) })" @click="remove(() => store.removeOpenItem(item.id))"><Trash2 :size="18" aria-hidden="true" /></button>
              </div>
            </fieldset>
            <div class="add-row">
              <button v-for="kind in openItemKinds" :key="kind" ref="addControl" type="button" class="btn btn-dashed" @click="store.addOpenItem(kind)"><Plus :size="16" aria-hidden="true" />{{ t(`scoping.actions.add.${kind}`) }}</button>
            </div>
          </template>
        </div>

        <div class="navigation">
          <button v-if="store.step > 1" type="button" class="btn btn-outline" @click="store.open('steps', store.step - 1)"><ArrowLeft :size="16" aria-hidden="true" />{{ t('scoping.actions.previous') }}</button>
          <button v-else type="button" class="btn btn-outline" @click="store.open('intro')"><ArrowLeft :size="16" aria-hidden="true" />{{ t('scoping.nav') }}</button>
          <button v-if="store.step < STEP_COUNT" type="button" class="btn btn-primary" @click="store.open('steps', store.step + 1)">
            {{ t('scoping.actions.next', { step: t(`scoping.short.${stepKeys[store.step]}`) }) }}<ArrowRight :size="16" aria-hidden="true" />
          </button>
          <button v-else type="button" class="btn btn-primary" @click="store.open('note')">{{ t('scoping.actions.seeNote') }}<ArrowRight :size="16" aria-hidden="true" /></button>
        </div>
      </div>

      <aside class="aside">
        <section class="tip">
          <h2><Lightbulb :size="18" aria-hidden="true" />{{ t('scoping.tip.title') }}</h2>
          <p>{{ t(`scoping.tip.${key}`) }}</p>
        </section>
        <ScopingChecks :checks="stepChecks" />
        <p class="saved muted"><Check :size="14" aria-hidden="true" />{{ t('scoping.saved') }}</p>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.stepper ol { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: .5rem; }
.stepper button { inline-size: 100%; display: flex; align-items: center; gap: .5rem; min-block-size: 2.75rem; padding: 0 .6rem; border: 0; border-radius: .6rem; background: none; color: var(--portfolio-ink-mute); font: inherit; font-size: .82rem; font-weight: 500; text-align: start; cursor: pointer; }
.stepper button:hover { background: var(--scoping-sunken); }
.stepper button.done { color: var(--foreground); }
.stepper button[aria-current] { background: var(--portfolio-accent-soft); color: var(--portfolio-accent-strong); }
.dot { flex: none; display: inline-grid; place-items: center; inline-size: 1.5rem; block-size: 1.5rem; border-radius: 999px; border: 1px solid var(--input); font-size: .75rem; font-weight: 600; }
.done .dot { border-color: transparent; background: #d6e1e4; color: var(--portfolio-accent-strong); }
[aria-current] .dot { border-color: transparent; background: var(--portfolio-accent); color: #fff; }
.label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.layout { margin-block-start: 2.5rem; display: flex; flex-wrap: wrap; gap: 2.5rem; align-items: flex-start; }
.content { flex: 999 1 36rem; min-inline-size: 0; }
h1 { margin: .5rem 0 0; font-size: clamp(1.9rem, 4.5vw, 2.5rem); line-height: 1.1; }
h1:focus { outline: none; }
.summary { margin: .75rem 0 0; max-inline-size: 40rem; line-height: 1.6; color: var(--muted-foreground); }
.form { margin-block-start: 1.75rem; display: flex; flex-direction: column; gap: 1rem; }
.card { margin: 0; border: 1px solid var(--border); border-radius: .9rem; padding: 1rem; background: var(--card); box-shadow: var(--scoping-raised); display: flex; flex-direction: column; gap: .75rem; min-inline-size: 0; }
.card-row { display: flex; gap: .5rem; align-items: flex-end; }
.grow { flex: 1; }
.kind { flex: 0 0 9.5rem; }
.pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }
.triple { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .75rem; }
.add-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: .5rem; }
.story-actions { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: .75rem; }
.priorities { border: 0; margin: 0; padding: 0; display: flex; flex-wrap: wrap; align-items: center; gap: .4rem; }
.priorities legend { float: left; margin-inline-end: .5rem; font-size: .82rem; font-weight: 600; }
.pill { background: var(--card); display: inline-flex; align-items: center; gap: .4rem; min-block-size: 2.5rem; padding: 0 .8rem; border-radius: 999px; border: 1px solid var(--input); font-size: .82rem; cursor: pointer; }
.pill.selected { background: var(--portfolio-accent); border-color: var(--portfolio-accent); color: #fff; font-weight: 600; }
.pill input { margin: 0; accent-color: currentColor; }
.board { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .75rem; }
.column { --tone: var(--portfolio-accent); background: var(--scoping-sunken); border-radius: .9rem; padding: .85rem; display: flex; flex-direction: column; gap: .6rem; min-block-size: 12rem; min-inline-size: 0; }
.column.should { --tone: #3a6c7b; } .column.could { --tone: #4f6d76; } .column.wont { --tone: #5d6a70; }
.column h2 { margin: 0; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: .25rem .5rem; font-size: .88rem; font-weight: 600; color: var(--tone); }
.column h2 .muted { font-size: .72rem; font-weight: 500; }
.story { background: var(--card); border-radius: .6rem; padding: .7rem; border-block-start: 3px solid var(--tone); box-shadow: 0 1px 2px rgb(28 42 48 / 6%); display: flex; flex-direction: column; gap: .3rem; min-inline-size: 0; }
.story p { margin: 0; overflow-wrap: anywhere; }
.who { font-size: .68rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--portfolio-ink-mute); }
.what { font-size: .85rem; line-height: 1.45; }
.why { font-size: .78rem; line-height: 1.4; color: var(--portfolio-ink-mute); }
.story-tools { display: flex; align-items: center; gap: .25rem; margin-block-start: .25rem; }
.story-tools select { flex: 1; min-inline-size: 0; min-block-size: 2.75rem; border: 1px solid var(--input); border-radius: .4rem; padding: 0 .4rem; background: var(--card); font: inherit; font-size: .75rem; color: var(--foreground); }
.navigation { margin-block-start: 2rem; display: flex; flex-wrap: wrap; justify-content: space-between; gap: .75rem; }
.aside { flex: 1 1 18rem; min-inline-size: 0; display: flex; flex-direction: column; gap: 1rem; }
.tip { border-radius: .9rem; padding: 1.25rem; background: var(--portfolio-accent-soft); }
.tip h2 { margin: 0; display: flex; align-items: center; gap: .5rem; font-size: .9rem; font-weight: 600; color: var(--portfolio-accent-strong); }
.tip p { margin: .6rem 0 0; font-size: .9rem; line-height: 1.6; }
.saved { margin: 0; display: flex; align-items: center; gap: .4rem; font-size: .8rem; }
.visually-hidden { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (max-width: 960px) {
  .board { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 720px) {
  .stepper ol { grid-template-columns: repeat(6, minmax(0, 1fr)); gap: .25rem; }
  .stepper .label { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .stepper button { justify-content: center; padding: 0; }
  .triple, .pair { grid-template-columns: minmax(0, 1fr); }
  .card-row { flex-wrap: wrap; }
  .kind { flex: 1 1 100%; }
}
@media (max-width: 520px) {
  .board { grid-template-columns: minmax(0, 1fr); }
  .navigation .btn { flex: 1 1 100%; }
}
</style>
