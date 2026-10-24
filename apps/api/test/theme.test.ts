import test from 'node:test';
import assert from 'node:assert/strict';
import { themeFromCookie } from '../src/web.js';

test('the theme cookie only accepts light or dark, anything else follows the system', () => {
  assert.equal(themeFromCookie('portfolio_theme=dark'), 'dark');
  assert.equal(themeFromCookie('other=1; portfolio_theme=light'), 'light');
  assert.equal(themeFromCookie('portfolio_theme="><script>'), null);
  assert.equal(themeFromCookie('portfolio_theme=blue'), null);
  assert.equal(themeFromCookie(undefined), null);
});
