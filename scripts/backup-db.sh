#!/bin/bash
# BrightSign DB Backup Script
# Runs daily via cron, keeps 14 days of backups
# Usage: ./scripts/backup-db.sh

set -euo pipefail

BACKUP_DIR="/root/backups"
CONTAINER="brightsign-postgres"
DB_NAME="medusa"
DB_USER="medusa"
RETENTION_DAYS=14
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
GPG_PASSPHRASE="${BACKUP_GPG_PASSPHRASE:-}"

# Determine file extension based on encryption
if [ -n "$GPG_PASSPHRASE" ]; then
  BACKUP_FILE="${BACKUP_DIR}/brightsign_${TIMESTAMP}.sql.gz.gpg"
else
  BACKUP_FILE="${BACKUP_DIR}/brightsign_${TIMESTAMP}.sql.gz"
fi

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Dump database (compressed, optionally encrypted)
echo "[$(date)] Starting backup..."
if [ -n "$GPG_PASSPHRASE" ]; then
  docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" \
    | gzip \
    | gpg --batch --yes --symmetric --cipher-algo AES256 --passphrase "$GPG_PASSPHRASE" \
    > "$BACKUP_FILE"
  echo "[$(date)] Backup encrypted with AES-256"
else
  docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"
  echo "[$(date)] WARNING: BACKUP_GPG_PASSPHRASE not set — backup is unencrypted"
fi

# Verify backup is not empty
if [ ! -s "$BACKUP_FILE" ]; then
  echo "[$(date)] ERROR: Backup file is empty!"
  rm -f "$BACKUP_FILE"
  exit 1
fi

FILESIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "[$(date)] Backup complete: $BACKUP_FILE ($FILESIZE)"

# Remove backups older than retention period
DELETED=$(find "$BACKUP_DIR" -name "brightsign_*.sql.gz*" -mtime +$RETENTION_DAYS -delete -print | wc -l)
if [ "$DELETED" -gt 0 ]; then
  echo "[$(date)] Cleaned up $DELETED old backup(s)"
fi

echo "[$(date)] Done. Active backups:"
ls -lh "$BACKUP_DIR"/brightsign_*.sql.gz* 2>/dev/null | tail -5
