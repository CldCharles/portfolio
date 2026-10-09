#!/usr/bin/env bash
# Met en ligne la dernière version de main. À lancer avec sudo sur le serveur.
set -euo pipefail
app=/opt/portfolio/app
sudo -u portfolio git -C "$app" pull --ff-only
sudo -u portfolio bash -c "cd '$app' && npm ci && npm run build"
# Unités et proxy versionnés avec le code.
install -m 644 "$app/deploy/portfolio.service" "$app/deploy/portfolio-backup.service" "$app/deploy/portfolio-backup.timer" /etc/systemd/system/
systemctl daemon-reload
systemctl restart portfolio
for attempt in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:3000/api/health >/dev/null; then echo "Portfolio en ligne."; exit 0; fi
  sleep 1
done
echo "L'API ne répond pas : journalctl -u portfolio -n 50" >&2
exit 1
