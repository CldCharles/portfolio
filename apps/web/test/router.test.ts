import test from 'node:test';
import assert from 'node:assert/strict';
import { createPinia } from 'pinia';
import type { RouteLocationNormalized } from 'vue-router';
import { createPortfolioRouter } from '../src/app/router.ts';

const route = (path: string, hash = '') => ({ path, hash }) as RouteLocationNormalized;

test('table of contents anchors scroll to their section instead of the page top', () => {
  const scroll = createPortfolioRouter(createPinia(), true).options.scrollBehavior!;
  assert.deepEqual(scroll(route('/', '#skills'), route('/'), null), { el: '#skills', top: 0, behavior: 'smooth' });
  assert.deepEqual(scroll(route('/', '#skills'), route('/privacy'), null), { el: '#skills', top: 0, behavior: 'auto' });
  assert.deepEqual(scroll(route('/privacy'), route('/', '#skills'), null), { top: 0 });
  assert.deepEqual(scroll(route('/'), route('/privacy'), { left: 0, top: 420 }), { left: 0, top: 420 });
});
