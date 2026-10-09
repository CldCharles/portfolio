import test from 'node:test';
import assert from 'node:assert/strict';
import { trustProxySetting } from '../src/proxy.js';

test('TRUST_PROXY is off by default and accepts hop counts or address lists only', () => {
  assert.equal(trustProxySetting(undefined), false);
  assert.equal(trustProxySetting('  '), false);
  assert.equal(trustProxySetting('1'), 1);
  assert.equal(trustProxySetting('loopback, 10.0.0.1'), 'loopback, 10.0.0.1');
  for (const invalid of ['0', '11', 'true', 'FALSE']) assert.throws(() => trustProxySetting(invalid));
});
