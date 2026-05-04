# Multi-stage Dockerfile.
# Stage 1: build the frontend static assets with Node.
FROM node:20-bullseye-slim AS frontend-builder
WORKDIR /tmp/frontend
COPY frontend/package.json frontend/package-lock.json ./
COPY frontend/ ./
RUN npm ci && npm run build

# Stage 2: runtime image for PHP + nginx.
FROM php:8.2-fpm-bullseye
WORKDIR /var/www/html

# Install runtime dependencies and remove default nginx site.
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx git unzip zip sqlite3 libsqlite3-dev libzip-dev curl \
    && docker-php-ext-install pdo_sqlite zip \
    && rm -rf /var/lib/apt/lists/* \
    && rm -f /etc/nginx/sites-enabled/default /etc/nginx/sites-available/default

# Copy backend code and built frontend output.
COPY backend/ /var/www/html/
COPY --from=frontend-builder /tmp/frontend/dist /var/www/html/public

# Install Composer dependencies and prepare env/database files.
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && if [ ! -f /var/www/html/.env ]; then cp /var/www/html/.env.example /var/www/html/.env; fi \
    && composer install --working-dir=/var/www/html --no-dev --no-interaction --prefer-dist --optimize-autoloader --ignore-platform-req=ext-grpc \
    && php artisan key:generate --force \
    && mkdir -p /var/www/html/database \
    && touch /var/www/html/database/database.sqlite \
    && chown -R www-data:www-data /var/www/html

# nginx config: serve frontend assets and proxy API routes to Laravel.
RUN printf '%s\n' \
    'server {' \
    '    listen 80;' \
    '    server_name _;' \
    '    root /var/www/html/public;' \
    '    index index.html index.php;' \
    '' \
    '    location /api {' \
    '        try_files $uri $uri/ /index.php?$query_string;' \
    '    }' \
    '' \
    '    location /sanctum {' \
    '        try_files $uri $uri/ /index.php?$query_string;' \
    '    }' \
    '' \
    '    location / {' \
    '        try_files $uri $uri/ /index.html;' \
    '    }' \
    '' \
    '    location ~ \.php$ {' \
    '        include fastcgi_params;' \
    '        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;' \
    '        fastcgi_index index.php;' \
    '        fastcgi_pass 127.0.0.1:9000;' \
    '    }' \
    '' \
    '    location ~ /\.(?!well-known).* {' \
    '        deny all;' \
    '    }' \
    '}' \
    > /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start php-fpm and nginx together.
CMD ["sh", "-c", "php-fpm -D && nginx -g 'daemon off;' "]
