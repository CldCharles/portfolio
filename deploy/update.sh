#!/usr/bin/env bash
# Met en ligne la dernière version de main. À lancer avec sudo sur le serveur.
set -euo pipefail
app=/opt/portfolio/app
if [[ -z "${UPDATE_PULLED:-}" ]]; then
  sudo -u portfolio git -C "$app" pull --ff-only
  # bash continue de lire l'ancien fichier : relancer la version qui vient d'être récupérée.
  exec env UPDATE_PULLED=1 bash "$app/deploy/update.sh"
fi
sudo -u portfolio bash -c "cd '$app' && npm ci && npm run build"
# Unités systemd et Caddyfile sont versionnés avec le code : les réinstaller.
install -m 644 "$app/deploy/portfolio.service" "$app/deploy/portfolio-backup.service" "$app/deploy/portfolio-backup.timer" /etc/systemd/system/
systemctl daemon-reload
domain="$(sed -n 's#^PUBLIC_ORIGIN=https://##p' /etc/portfolio/portfolio.env)"
if [[ -n "$domain" ]]; then
  bash "$app/deploy/install-caddy.sh"
  bash "$app/deploy/render-caddyfile.sh" "$domain"
  # admin off : pas de rechargement à chaud, redémarrage (coupure d'une seconde).
  systemctl restart caddy
fi
systemctl restart portfolio
for attempt in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:3000/api/health >/dev/null; then echo "Portfolio en ligne."; exit 0; fi
  sleep 1
done
echo "L'API ne répond pas : journalctl -u portfolio -n 50" >&2
exit 1
