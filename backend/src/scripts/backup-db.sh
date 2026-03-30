#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   MONGO_URI="mongodb+srv://..." ./src/scripts/backup-db.sh
# Optional:
#   BACKUP_DIR=./backups ./src/scripts/backup-db.sh

if [[ -z "${MONGO_URI:-}" ]]; then
  echo "MONGO_URI is required"
  exit 1
fi

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
TARGET_DIR="${BACKUP_DIR}/mongo-${TIMESTAMP}"

mkdir -p "${TARGET_DIR}"
mongodump --uri="${MONGO_URI}" --out="${TARGET_DIR}"

echo "Backup completed: ${TARGET_DIR}"
