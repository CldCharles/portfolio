import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { publicFiles } from '../src/web.js';

test('every icon and share image served in production exists in apps/web/public', () => {
  for (const file of publicFiles) {
    assert.match(file, /^\/[a-z-]+\.(ico|svg|png)$/);
    assert.ok(existsSync(fileURLToPath(new URL(`../../web/public${file}`, import.meta.url))), file);
  }
});
