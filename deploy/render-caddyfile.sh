#!/usr/bin/env bash
# Écrit /etc/caddy/Caddyfile pour le domaine donné, seulement s'il est valide :
# un fichier refusé ne remplace jamais celui en place. À lancer avec sudo.
set -euo pipefail
domain="$1"
app=/opt/portfolio/app
candidate="$(mktemp)"
trap 'rm -f "$candidate"' EXIT
sed "s/__DOMAIN__/$domain/g" "$app/deploy/Caddyfile" > "$candidate"
/usr/local/bin/caddy validate --config "$candidate" --adapter caddyfile >/dev/null
install -m 644 "$candidate" /etc/caddy/Caddyfile
