import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import type { CvRepository } from '../src/cv/repository.js';

test('security headers forbid external fonts, styles and scripts and framing by other sites', async () => {
  const server = createApp({ read: () => null } as unknown as CvRepository).listen(0, '127.0.0.1');
  try {
    await new Promise(resolve => server.once('listening', resolve));
    const { port } = server.address() as { port: number };
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    const csp = response.headers.get('content-security-policy') ?? '';
    assert.match(csp, /font-src 'self';/);
    assert.match(csp, /style-src 'self' 'unsafe-inline';/);
    assert.match(csp, /script-src 'self';/);
    assert.doesNotMatch(csp, /https:/);
    assert.match(csp, /frame-ancestors 'self'/);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('x-powered-by'), null);
  } finally { server.close(); }
});
