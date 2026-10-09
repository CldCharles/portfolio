# Déploiement sur Amazon Lightsail (Stockholm)

Un seul serveur Ubuntu fait tourner l’API Node, qui sert aussi le site (rendu
serveur), l’admin et le PDF. Caddy fournit le HTTPS. La base SQLite est sur le
disque du serveur et sauvegardée chaque jour. Coût indicatif : environ 7 $/mois
pour le serveur (1 Go), plus le nom de domaine.

Le compte AWS du propriétaire (« nouvelle expérience ») limite toutes les ressources
à la région du projet, `eu-north-1` (Stockholm) : Séoul n’est pas disponible. Depuis
la Corée, la latence (~250 ms) reste sans effet notable pour un CV ; le site est léger
et mis en cache par le navigateur.

Fichiers : `deploy/setup.sh` (installation), `deploy/update.sh` (mises à jour),
`deploy/backup.sh` et son minuteur, `deploy/portfolio.service`, `deploy/Caddyfile`
et `deploy/portfolio.env.example`.

## 1. Créer le serveur

1. Console Lightsail → **Create instance** : région **Stockholm (eu-north-1)**, la région du projet,
   plateforme Linux, image **Ubuntu 24.04 LTS**, offre à **1 Go de mémoire**
   (`micro`, ~7 $/mois ; la compilation dépasse 512 Mo, l’offre à 512 Mo ne fonctionne
   qu’avec la mémoire d’échange ajoutée par le script, plus lentement).
2. Onglet **Networking** : créer une **adresse IP statique** et l’attacher ;
   dans le pare-feu IPv4, ajouter **HTTPS (443)** (SSH et HTTP sont ouverts par défaut).
3. Onglet **Snapshots** : activer les **snapshots automatiques** (sauvegarde du
   disque entier, en complément de la sauvegarde quotidienne de la base).

## 2. Nom de domaine

Chez le registraire (ou dans Cloudflare en mode « DNS only », nuage gris, pour
que Caddy obtienne lui-même le certificat), créer :

| Type | Nom | Valeur |
| --- | --- | --- |
| A | `@` | IP statique Lightsail |
| A | `www` | IP statique Lightsail |

Attendre que `dig +short mon-domaine.com` renvoie l’IP avant l’étape suivante.

## 3. Installer

Depuis le terminal SSH de Lightsail (ou `ssh ubuntu@IP`) :

```sh
curl -fsSLO https://raw.githubusercontent.com/CldCharles/portfolio/main/deploy/setup.sh
sudo bash setup.sh mon-domaine.com
```

Le script installe Node.js 22, Caddy, git et sqlite3 depuis leurs dépôts officiels,
ajoute 1 Go de mémoire d’échange, crée l’utilisateur système `portfolio`, clone le
dépôt dans `/opt/portfolio/app`, compile, écrit `/etc/portfolio/portfolio.env`,
active le service, la sauvegarde quotidienne (03:30, heure de Séoul) et le
pare-feu. Il est relançable sans effet de bord.

## 4. Compte admin et contenu

Créer le compte (mot de passe saisi de façon masquée, jamais affiché) :

```sh
sudo -u portfolio bash -c 'set -a; . /etc/portfolio/portfolio.env; cd /opt/portfolio/app && npm run admin:setup'
```

Puis ouvrir `https://mon-domaine.com/admin`, préparer le CV et le publier.

Pour reprendre la base locale à la place (contenu et compte admin compris) :

```sh
# Sur l’ordinateur : copie cohérente (la base est en mode WAL)
sqlite3 apps/api/data/portfolio.sqlite ".backup /tmp/portfolio.sqlite"
scp /tmp/portfolio.sqlite ubuntu@IP:/tmp/portfolio.sqlite
rm /tmp/portfolio.sqlite
# Sur le serveur
sudo systemctl stop portfolio
sudo install -o portfolio -g portfolio -m 640 /tmp/portfolio.sqlite /var/lib/portfolio/portfolio.sqlite
sudo rm -f /var/lib/portfolio/portfolio.sqlite-wal /var/lib/portfolio/portfolio.sqlite-shm /tmp/portfolio.sqlite
sudo systemctl start portfolio
```

## 5. Mettre à jour

Après une fusion dans `main` :

```sh
sudo bash /opt/portfolio/app/deploy/update.sh
```

Le script récupère `main`, réinstalle les dépendances, compile, recharge les
unités systemd et la configuration Caddy, redémarre l’API et vérifie `/api/health`. Les migrations SQLite
s’appliquent au démarrage ; une sauvegarde manuelle avant une mise à jour qui
change le schéma reste prudente (voir ci-dessous).

## Exploitation

| Besoin | Commande |
| --- | --- |
| État du service | `systemctl status portfolio` |
| Journaux de l’API | `journalctl -u portfolio -n 100` |
| Sauvegarde immédiate | `sudo systemctl start portfolio-backup` |
| Sauvegardes disponibles | `sudo ls /var/backups/portfolio` (14 jours conservés) |
| Copier une sauvegarde sur l’ordinateur | voir ci-dessous |
| Modifier la configuration | `sudoedit /etc/portfolio/portfolio.env` puis `sudo systemctl restart portfolio` |

Les sauvegardes contiennent l’empreinte du mot de passe admin et les sessions : elles
ne sont lisibles que par `portfolio`. Pour en récupérer une, la copier temporairement :

```sh
# Sur le serveur
sudo install -o ubuntu -m 600 /var/backups/portfolio/portfolio-AAAA-MM-JJ.sqlite.gz /tmp/
# Sur l’ordinateur
scp ubuntu@IP:/tmp/portfolio-AAAA-MM-JJ.sqlite.gz .
# Sur le serveur
rm /tmp/portfolio-AAAA-MM-JJ.sqlite.gz
```

Restaurer une sauvegarde : arrêter le service, décompresser le fichier choisi vers
`/var/lib/portfolio/portfolio.sqlite` (propriétaire `portfolio`), supprimer les
fichiers `-wal`/`-shm`, redémarrer.

## Sécurité et confidentialité

- L’API n’écoute que sur `127.0.0.1:3000` ; seul Caddy est exposé (80/443).
  `TRUST_PROXY=loopback` : la limite de connexion admin s’applique à l’IP réelle.
- Le service tourne sous un utilisateur dédié, sans droit d’écriture hors de
  `/var/lib/portfolio` ; la configuration n’est lisible que par root et ce service.
- `NODE_ENV=production` active les cookies `Secure`, HSTS et l’origine HTTPS exacte.
- Aucun journal d’accès HTTP (pas de directive `log` dans Caddy). Journaux du serveur
  conservés 14 jours au plus : journald, fichiers rsyslog et historiques de connexion
  (logrotate quotidien, fichier courant et 13 archives, sans seuil de taille) ; journal du pare-feu désactivé. Ces informations
  alimentent la notice via `PUBLIC_HOST_*`.
- Les mises à jour de sécurité d’Ubuntu s’installent automatiquement
  (`unattended-upgrades`, actif par défaut sur Lightsail).
