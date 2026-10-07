import { shallowRef } from 'vue';
import { defineStore } from 'pinia';
import type { AdminSession } from '@portfolio/contracts';
import { adminRequest } from './api';

export const useAuthStore = defineStore('auth', () => {
  const session = shallowRef<AdminSession | null>(null);
  async function check() { session.value = await adminRequest<AdminSession>('/session'); return session.value; }
  async function login(username: string, password: string) { session.value = await adminRequest<AdminSession>('/login', 'POST', { username, password }); }
  async function logout() { await adminRequest('/logout', 'POST', {}, session.value?.csrfToken); session.value = { configured: true, authenticated: false }; }
  function expire() { session.value = { configured: true, authenticated: false }; }
  return { session, check, login, logout, expire };
});
