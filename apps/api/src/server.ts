import { createApp } from './app.js';
import { installBuiltWeb } from './web.js';
import { openDatabase } from './database.js';
import { trustProxySetting } from './proxy.js';

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '127.0.0.1';
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT doit être un entier compris entre 1 et 65535.');
}
const trustProxy = trustProxySetting(process.env.TRUST_PROXY);

const { db, repository, admin } = openDatabase();
const app = createApp(repository, admin);
if (trustProxy !== false) app.set('trust proxy', trustProxy);
if (process.env.NODE_ENV === 'production' || process.env.SERVE_WEB === '1') await installBuiltWeb(app, repository);
admin.purgeExpired();
const expiryCleanup = setInterval(() => admin.purgeExpired(), 60_000);
expiryCleanup.unref();
const server = app.listen(port, host, () => {
  console.log(`API disponible sur http://${host}:${port}`);
});
server.on('error', (error) => {
  console.error(error);
  process.exit(1);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    clearInterval(expiryCleanup);
    server.close(() => { db.close(); process.exit(0); });
    setTimeout(() => process.exit(1), 5000).unref();
  });
}
