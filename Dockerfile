# ==========================================
# Stage 1: Build Frontend Assets (Vite / React)
# ==========================================
FROM node:20-alpine AS frontend
WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .
RUN npm run build

# ==========================================
# Stage 2: PHP Application & Nginx Server
# ==========================================
FROM php:8.4.27-fpm-alpine

# Update OS packages & install runtime dependencies
RUN apk update && apk upgrade && apk add --no-cache \
    nginx \
    curl \
    git \
    zip \
    unzip \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    oniguruma-dev \
    libxml2-dev \
    libzip-dev \
    icu-dev \
    libwebp-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        xml \
        zip \
        intl \
        opcache \
    && php -r 'if (! extension_loaded("gd") || ! function_exists("imagewebp")) { fwrite(STDERR, "PHP GD WebP support is required\n"); exit(1); }'

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy source code (dibatasi oleh .dockerignore agar tidak membawa vendor/node_modules Windows)
COPY . .

# Copy compiled frontend assets dari stage 1
COPY --from=frontend /app/public/build ./public/build

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Setup Nginx & Entrypoint
RUN mkdir -p /run/nginx
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/php-fpm-pool.conf /usr/local/etc/php-fpm.d/www.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Permissions folder storage & bootstrap cache
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Dokploy & Traefik mengekspos port 80 & 8000 untuk web HTTP
EXPOSE 80 8000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
