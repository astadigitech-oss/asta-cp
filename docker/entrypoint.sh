#!/bin/sh
set -e

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

# Bersihkan cache view, route, dan config agar perubahan Blade & web.php langsung aktif
php artisan optimize:clear || true

# Test syntax konfigurasi Nginx agar jika ada error langsung terbaca di log Dokploy
echo "==> Testing Nginx configuration..."
nginx -t

# Jalankan PHP-FPM di background
echo "==> Starting PHP-FPM..."
php-fpm -D

# Jalankan Nginx di foreground agar container tetap hidup (tidak loop restart)
echo "==> Starting Nginx on port 80..."
exec nginx -g "daemon off;"


