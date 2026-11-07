#!/bin/sh
set -e

# Keep PHP-FPM concurrency bounded; override based on the container memory budget.
FPM_MAX_CHILDREN="${FPM_MAX_CHILDREN:-2}"
case "$FPM_MAX_CHILDREN" in
    ''|*[!0-9]*|0)
        echo "FPM_MAX_CHILDREN must be a positive integer." >&2
        exit 1
        ;;
esac
sed -i "s/__FPM_MAX_CHILDREN__/$FPM_MAX_CHILDREN/" /usr/local/etc/php-fpm.d/www.conf

# Wajib di Alpine: buat folder PID Nginx agar tidak crash saat start
mkdir -p /run/nginx

# Pastikan folder log Nginx ada
mkdir -p /var/log/nginx

# Pastikan permission storage & cache benar
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Pastikan tidak ada file dev Vite tertinggal
rm -f /var/www/public/hot

# Publish Livewire static assets ke public/livewire/ agar dapat diakses Nginx langsung
# Ini mencegah 404 pada /livewire/livewire.min.js yang bisa di-cache oleh Cloudflare
mkdir -p /var/www/public/livewire
cp -f /var/www/vendor/livewire/livewire/dist/livewire.min.js /var/www/public/livewire/ 2>/dev/null || true
cp -f /var/www/vendor/livewire/livewire/dist/livewire.min.js.map /var/www/public/livewire/ 2>/dev/null || true
cp -f /var/www/vendor/livewire/livewire/dist/livewire.esm.js /var/www/public/livewire/ 2>/dev/null || true
cp -f /var/www/vendor/livewire/livewire/dist/manifest.json /var/www/public/livewire/ 2>/dev/null || true

# Buat storage link (aman tanpa rm -rf, tidak menghapus file di storage)
php artisan storage:link --force || true

# Jalankan migrasi jika perlu
php artisan migrate --force || true

# Downscale oversized original storage images agar tidak memicu payload raksasa pada Lighthouse / PageSpeed
php artisan images:downscale-storage || true

# Bersihkan cache lama dan kompilasi ulang view & config untuk performa tinggi
php artisan optimize:clear || true
php artisan config:cache || true
php artisan view:cache || true

# Test syntax konfigurasi Nginx agar jika ada error langsung terbaca di log Dokploy
echo "==> Testing Nginx configuration..."
nginx -t

# Jalankan PHP-FPM di background
echo "==> Starting PHP-FPM..."
php-fpm -D

# Jalankan Nginx di foreground agar container tetap hidup (tidak loop restart)
echo "==> Starting Nginx on port 80..."
exec nginx -g "daemon off;"

