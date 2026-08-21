#!/bin/sh

echo "==> Running post-deploy commands..."

php artisan storage:link --force
php artisan filament:upgrade
php artisan migrate --force
php artisan optimize:clear

echo "==> Starting application..."
php artisan serve --host=0.0.0.0 --port=8000
