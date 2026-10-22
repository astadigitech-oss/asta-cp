# 1. Base Image spesifik PHP 8.3.36
FROM php:8.3.36-fpm-alpine

# 2. Install sistem dependensi & ekstensi PHP yang dibutuhkan Laravel
RUN apk add --no-cache \
    zip \
    unzip \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    oniguruma-dev \
    libxml2-dev \
    git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd xml

# 3. Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 4. Set working directory
WORKDIR /var/www

# 5. Copy seluruh source code ke dalam container
COPY . .

# 6. Install dependensi composer
RUN composer install --no-dev --optimize-autoloader

# 7. Set permission folder storage & bootstrap/cache
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]