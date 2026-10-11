#!/usr/bin/env bash
# Installation initiale sur un serveur Ubuntu 24.04 neuf (Amazon Lightsail, Stockholm).
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

echo "== Paquets système et Node.js 22 (Caddy : paquet Ubuntu pour l'unité systemd, binaire officiel ensuite)"
timedatectl set-timezone Asia/Seoul
# Ancien dépôt Caddy (Cloudsmith), devenu payant : le retirer s'il a été ajouté.
rm -f /etc/apt/sources.list.d/caddy-stable.list /usr/share/keyrings/caddy-stable-archive-keyring.gpg
# fail2ban : configuré avant son installation, qui le démarre aussitôt. Journal dans
# journald (14 jours, comme les autres journaux), bannissements oubliés après 1 jour.
install -d /etc/fail2ban/fail2ban.d /etc/fail2ban/jail.d
printf '[Definition]\nlogtarget = SYSTEMD-JOURNAL\ndbpurgeage = 1d\n' > /etc/fail2ban/fail2ban.d/portfolio.local
# 5 échecs SSH en 10 min = 1 h de bannissement.
printf '[sshd]\nenabled = true\nbackend = systemd\nmaxretry = 5\nfindtime = 10m\nbantime = 1h\n' > /etc/fail2ban/jail.d/portfolio.local
apt-get update
apt-get install -y ca-certificates curl gnupg git sqlite3 build-essential ufw caddy fail2ban python3-systemd
if ! command -v node >/dev/null || [[ "$(node -v)" != v22.* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
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
bash "$app/deploy/install-caddy.sh"
bash "$app/deploy/render-caddyfile.sh" "$domain"
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

echo "== SSH : connexion root interdite, robots bannis"
# Connexion par clé uniquement (réglage Lightsail) ; root ne se connecte jamais.
printf 'PermitRootLogin no\n' > /etc/ssh/sshd_config.d/10-portfolio.conf
# Configuration refusée : la retirer, sinon SSH ne redémarrerait plus.
if ! sshd -t; then rm -f /etc/ssh/sshd_config.d/10-portfolio.conf; echo "Configuration SSH invalide, retirée." >&2; exit 1; fi
systemctl reload ssh
systemctl enable fail2ban
systemctl restart fail2ban
# Aucun fichier de journal fail2ban (il contiendrait des IP au-delà de 14 jours).
rm -f /var/log/fail2ban.log* /etc/logrotate.d/fail2ban

echo "== Services"
install -m 644 "$app/deploy/portfolio.service" "$app/deploy/portfolio-backup.service" "$app/deploy/portfolio-backup.timer" /etc/systemd/system/
systemctl daemon-reload
systemctl enable portfolio portfolio-backup.timer
# restart, pas seulement start : une relance doit charger le code recompilé.
systemctl restart portfolio
systemctl start portfolio-backup.timer
# admin off dans le Caddyfile : pas de rechargement à chaud.
systemctl restart caddy

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
