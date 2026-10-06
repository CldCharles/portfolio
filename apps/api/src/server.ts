import { app } from './app.js';

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '127.0.0.1';
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT doit être un entier compris entre 1 et 65535.');
}

const server = app.listen(port, host, () => {
  console.log(`API disponible sur http://${host}:${port}`);
});
server.on('error', (error) => {
  console.error(error);
  process.exit(1);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  });
}
