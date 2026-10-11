#!/usr/bin/env bash
# Installe le binaire officiel de Caddy (GitHub) à la place de la version des dépôts
# Ubuntu, figée en 2.6 et sans tous les correctifs de sécurité hors Ubuntu Pro.
# Le paquet Ubuntu reste installé pour l'utilisateur caddy et l'unité systemd ;
# une surcharge systemd pointe vers /usr/local/bin/caddy. Relançable : ne fait rien
# si la bonne version est déjà en place. À lancer avec sudo, appelé par setup.sh et update.sh.
set -euo pipefail

version=2.11.4
# SHA-512 publié dans caddy_2.11.4_checksums.txt de la release officielle.
sha512=8220d1f013b6f27510247b2360c9e0ca9f018feebd82515f07635318b34ff9777ccc8fd0b6e6f2486ce3a33fe389fbb7db12d05baa474f4587509fb4f5ebf1c9
binary=/usr/local/bin/caddy

if [[ "$(uname -m)" != x86_64 ]]; then echo "Architecture non prise en charge : $(uname -m)" >&2; exit 1; fi
if [[ -x "$binary" ]] && "$binary" version | grep -q "^v$version "; then
  echo "Caddy $version déjà installé."
else
  work="$(mktemp -d)"
  trap 'rm -rf "$work"' EXIT
  archive="$work/caddy.tar.gz"
  curl -fsSL -o "$archive" "https://github.com/caddyserver/caddy/releases/download/v$version/caddy_${version}_linux_amd64.tar.gz"
  echo "$sha512  $archive" | sha512sum -c --quiet -
  tar -xzf "$archive" -C "$work" caddy
  install -m 755 "$work/caddy" "$binary"
  echo "Caddy $version installé."
fi

install -d /etc/systemd/system/caddy.service.d
cat > /etc/systemd/system/caddy.service.d/official-binary.conf <<EOF
[Service]
ExecStart=
ExecStart=$binary run --environ --config /etc/caddy/Caddyfile
# Le Caddyfile coupe l'API d'administration (admin off) : pas de rechargement à chaud,
# un changement s'applique avec systemctl restart caddy.
ExecReload=
EOF
systemctl daemon-reload
