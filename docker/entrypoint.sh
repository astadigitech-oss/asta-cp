#!/bin/sh
set -e

# Pastikan permission storage & cache benar
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Generate storage link jika belum ada
php artisan storage:link --force || true

# Jalankan PHP-FPM di background
php-fpm -D

# Jalankan Nginx di foreground agar container tetap hidup (tidak loop restart)
exec nginx -g "daemon off;"

