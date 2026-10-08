import test from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/database.js';
import { publicSiteConfig } from '../src/public-config.js';

test('public config omits secrets and does not invent hosting, contact or a localhost canonical', () => {
  const { db, repository } = openDatabase(':memory:');
  try {
    const config = publicSiteConfig(repository, { PUBLIC_ORIGIN: 'http://127.0.0.1:5173', ADMIN_PASSWORD: 'never-public', PUBLIC_CONTACT_EMAIL: '' });
    assert.deepEqual(config, { editorName: 'Claude Charles Valentin', contactEmail: null, publicOrigin: null, hostName: null, hostCountry: null, hostLogRetention: null });
    assert.equal(publicSiteConfig(repository, { SITE_URL: 'https://example.com', PUBLIC_CONTACT_EMAIL: 'cv@example.com' }).publicOrigin, 'https://example.com');
    assert.throws(() => publicSiteConfig(repository, { SITE_URL: 'http://localhost:3000' }));
    assert.throws(() => publicSiteConfig(repository, { PUBLIC_CONTACT_EMAIL: 'invalid' }));
  } finally { db.close(); }
});
