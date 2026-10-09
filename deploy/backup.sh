#!/usr/bin/env bash
# Sauvegarde cohérente de la base (commande .backup de SQLite, sûre pendant
# que l'API tourne), compressée, conservée 14 jours.
set -euo pipefail
database=/var/lib/portfolio/portfolio.sqlite
destination=/var/backups/portfolio
file="$destination/portfolio-$(date +%F).sqlite"
sqlite3 "$database" ".backup '$file'"
gzip -f "$file"
find "$destination" -name 'portfolio-*.sqlite.gz' -mtime +14 -delete
