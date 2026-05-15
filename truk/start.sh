#!/bin/bash
export DB_HOST="${DB_HOST:-localhost}"
export DB_PORT="${DB_PORT:-3306}"
export DB_NAME="${DB_NAME:-okekirim}"
export DB_USER="${DB_USER:-root}"
export DB_PASS="${DB_PASS:-}"
php -d session.save_path=/tmp/sessions -S 0.0.0.0:${PORT:-8080} -t /var/www/html
