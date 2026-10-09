#!/usr/bin/env bash
# Installation initiale sur un serveur Ubuntu 24.04 neuf (Amazon Lightsail, Séoul).
# Usage : sudo bash setup.sh mon-domaine.com
# Relançable : chaque étape vérifie ce qui existe déjà.
set -euo pipefail

domain="${1:-}"
repository="${REPOSITORY:-https://github.com/CldCharles/portfolio.git}"
if [[ ! "$domain" =~ ^[a-z0-9.-]+\.[a-z]{2,}$ ]]; then
  echo "Usage : sudo bash setup.sh mon-domaine.com" >&2
  exit 1
fi
if [[ $EUID -ne 0 ]]; then echo "Lancer avec sudo." >&2; exit 1; fi

app=/opt/portfolio/app
export DEBIAN_FRONTEND=noninteractive

echo "== Paquets système, Node.js 22 et Caddy (dépôts officiels)"
timedatectl set-timezone Asia/Seoul
apt-get update
apt-get install -y ca-certificates curl gnupg git sqlite3 build-essential ufw debian-keyring debian-archive-keyring apt-transport-https
if ! command -v node >/dev/null || [[ "$(node -v)" != v22.* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update
  apt-get install -y caddy
fi

echo "== Mémoire d'échange (la compilation dépasse 512 Mo)"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 1G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "== Utilisateur et dossiers"
id portfolio >/dev/null 2>&1 || useradd --system --home-dir /opt/portfolio --create-home --shell /usr/sbin/nologin portfolio
install -d -o portfolio -g portfolio -m 750 /var/lib/portfolio /var/backups/portfolio
install -d -o root -g portfolio -m 750 /etc/portfolio

echo "== Code et compilation"
[[ -d "$app/.git" ]] || sudo -u portfolio git clone "$repository" "$app"
sudo -u portfolio bash -c "cd '$app' && npm ci && npm run build"

echo "== Configuration"
if [[ ! -f /etc/portfolio/portfolio.env ]]; then
  sed "s/__DOMAIN__/$domain/g" "$app/deploy/portfolio.env.example" > /etc/portfolio/portfolio.env
  chown root:portfolio /etc/portfolio/portfolio.env
  chmod 640 /etc/portfolio/portfolio.env
fi
sed "s/__DOMAIN__/$domain/g" "$app/deploy/Caddyfile" > /etc/caddy/Caddyfile
# Journaux du serveur conservés 14 jours au plus, comme l'indique la notice de
# confidentialité : journald, fichiers rsyslog et historiques de connexion.
install -d /etc/systemd/journald.conf.d
printf '[Journal]\nMaxRetentionSec=14day\n' > /etc/systemd/journald.conf.d/portfolio.conf
systemctl restart systemd-journald
for rotation in /etc/logrotate.d/rsyslog /etc/logrotate.d/wtmp /etc/logrotate.d/btmp; do
  [[ -f "$rotation" ]] || continue
  # Quotidien, fichier courant + 13 archives, sans seuil de taille (minsize
  # bloquerait la rotation des petits historiques de connexion).
  sed -i -E 's/^([[:space:]]*)(weekly|monthly)$/\1daily/; s/^([[:space:]]*)rotate [0-9]+$/\1rotate 13/; /^[[:space:]]*minsize /d' "$rotation"
done

echo "== Services"
install -m 644 "$app/deploy/portfolio.service" "$app/deploy/portfolio-backup.service" "$app/deploy/portfolio-backup.timer" /etc/systemd/system/
systemctl daemon-reload
systemctl enable portfolio portfolio-backup.timer
# restart, pas seulement start : une relance doit charger le code recompilé.
systemctl restart portfolio
systemctl start portfolio-backup.timer
systemctl reload caddy || systemctl restart caddy

echo "== Pare-feu (penser aussi à ouvrir 80 et 443 dans la console Lightsail)"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
# Pas de journal des paquets bloqués (il contiendrait des adresses IP).
ufw logging off
ufw --force enable

echo
echo "Installation terminée. Étapes suivantes :"
echo "  1. Créer le compte admin :"
echo "     sudo -u portfolio bash -c 'set -a; . /etc/portfolio/portfolio.env; cd $app && npm run admin:setup'"
echo "  2. Ouvrir https://$domain/admin, préparer puis publier le CV."
