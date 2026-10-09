import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router';
import { useAuthStore } from '@/features/auth/store';
import type { Pinia } from 'pinia';
import { pinia } from './pinia';

export function createPortfolioRouter(store: Pinia, server = false) {
const router = createRouter({
  history: server ? createMemoryHistory() : createWebHistory(),
  routes: [
    { path: '/', component: () => import('@/pages/CvPage.vue') },
    { path: '/privacy', component: () => import('@/pages/PrivacyPage.vue') },
    { path: '/admin/login', component: () => import('@/pages/admin/LoginPage.vue') },
    { path: '/admin', component: () => import('@/pages/admin/EditorPage.vue'), meta: { admin: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  // In-page anchors (CV table of contents) go through the router too: scroll to
  // the target instead of the page top. The router ignores CSS scroll-margin,
  // so pass the section's margin (it clears the sticky mobile navigation).
  scrollBehavior: (to, from, saved) => {
    if (saved) return saved;
    if (!to.hash) return { top: 0 };
    const target = typeof document === 'undefined' ? null : document.getElementById(decodeURIComponent(to.hash.slice(1)));
    const margin = target ? Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0 : 0;
    return { el: decodeURIComponent(to.hash), top: margin, behavior: to.path === from.path ? 'smooth' : 'auto' };
  },
});
router.beforeEach(async to => {
  if (server || !to.path.startsWith('/admin')) return;
  const auth = useAuthStore(store);
  try { await auth.check(); } catch { auth.expire(); }
  if (to.meta.admin && !auth.session?.authenticated) return '/admin/login';
  if (to.path === '/admin/login' && auth.session?.authenticated) return '/admin';
});

return router;
}
export const router = typeof window === 'undefined' ? undefined : createPortfolioRouter(pinia);
