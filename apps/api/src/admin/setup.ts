import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import { stdin, stdout } from 'node:process';
import { openDatabase } from '../database.js';

// Local terminal only: passwords are never echoed or passed as CLI arguments.
if (!stdin.isTTY || !stdout.isTTY) throw new Error('Exécuter cette commande dans un terminal interactif.');
let muted = false;
const output = new Writable({ write(chunk, _encoding, callback) { if (!muted) stdout.write(chunk); callback(); } });
const reader = createInterface({ input: stdin, output, terminal: true });
reader.on('SIGINT', () => { reader.close(); process.exit(130); });
const { db, admin } = openDatabase();
try {
  const reset = process.argv.includes('--reset');
  if (admin.configured() && !reset) throw new Error('Un compte existe déjà. Pour changer ses identifiants et révoquer les sessions : ajouter --reset.');
  const username = await reader.question('Identifiant administrateur : ');
  stdout.write('Mot de passe (12 caractères minimum, saisie masquée) : ');
  muted = true;
  const password = await reader.question('');
  stdout.write('\nConfirmer le mot de passe : ');
  const confirmation = await reader.question('');
  muted = false;
  stdout.write('\n');
  if (password !== confirmation) throw new Error('Les mots de passe ne correspondent pas.');
  await admin.configure(username.trim(), password, reset);
  console.log('Compte administrateur enregistré. Les sessions précédentes sont révoquées.');
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Création impossible.');
  process.exitCode = 1;
} finally { reader.close(); db.close(); }
