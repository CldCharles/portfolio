<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from './store';
import { AdminApiError } from './api';
const emit = defineEmits<{ authenticated: [] }>();
const { t, te } = useI18n({ useScope: 'global' });
const auth = useAuthStore();
const username = ref('');
const password = ref('');
const busy = shallowRef(false);
const error = shallowRef('');
async function submit() {
  busy.value = true; error.value = '';
  try { await auth.login(username.value, password.value); password.value = ''; emit('authenticated'); }
  catch (reason) { const key = reason instanceof AdminApiError ? `admin.errors.${reason.code}` : ''; error.value = te(key) ? key : 'admin.errors.UNKNOWN'; }
  finally { busy.value = false; }
}
</script>

<template>
  <form class="login-form" @submit.prevent="submit">
    <p class="admin-eyebrow">{{ t('admin.privateArea') }}</p>
    <h1>{{ t('admin.loginTitle') }}</h1>
    <p class="muted">{{ t('admin.loginIntro') }}</p>
    <p v-if="auth.session && !auth.session.configured" class="notice">{{ t('admin.setupRequired') }} <code>npm run admin:setup</code></p>
    <p v-if="error" role="alert" class="error-message">{{ t(error) }}</p>
    <div class="field"><Label for="admin-username">{{ t('admin.username') }}</Label><Input id="admin-username" v-model="username" autocomplete="username" required maxlength="80" :disabled="busy" /></div>
    <div class="field"><Label for="admin-password">{{ t('admin.password') }}</Label><Input id="admin-password" v-model="password" type="password" autocomplete="current-password" required maxlength="256" :disabled="busy" /></div>
    <Button type="submit" class="admin-button" :disabled="busy || auth.session?.configured === false">{{ t(busy ? 'admin.connecting' : 'admin.login') }}</Button>
  </form>
</template>

<style scoped>
.login-form { max-inline-size: 28rem; margin: 3rem auto; display: grid; gap: 1.5rem; padding: clamp(1.3rem, 4vw, 2.5rem); background: var(--card); border: 1px solid var(--border); border-radius: .5rem; }
h1 { font-size: 2rem; letter-spacing: -.04em; line-height: 1.2; }
</style>
