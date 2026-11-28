# Local copy of the live server, for testing the real release package.
# Stage "build" runs deploy/build-release.sh; stage "server" unzips that package on Apache + PHP 8.2,
# like cPanel. Not used for deployment itself.

FROM php:8.2-cli AS build
COPY --from=mlocati/php-extension-installer:latest /usr/bin/install-php-extensions /usr/local/bin/
RUN apt-get update -qq && apt-get install -y -qq zip unzip git >/dev/null \
 && install-php-extensions intl zip gd exif bcmath pdo_mysql
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
COPY --from=node:20-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:20-bookworm-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm
ENV COMPOSER_ALLOW_SUPERUSER=1
WORKDIR /src
COPY . .
RUN sed -i 's/\r$//' deploy/build-release.sh deploy/prod-test/entrypoint.sh && bash deploy/build-release.sh

FROM php:8.2-apache AS server
COPY --from=mlocati/php-extension-installer:latest /usr/bin/install-php-extensions /usr/local/bin/
RUN apt-get update -qq && apt-get install -y -qq unzip >/dev/null \
 && install-php-extensions pdo_mysql intl gd zip exif bcmath opcache \
 && a2enmod rewrite headers >/dev/null \
 && cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
 && printf 'upload_max_filesize=20M\npost_max_size=25M\nmemory_limit=256M\nopcache.memory_consumption=256\nopcache.max_accelerated_files=20000\n' > "$PHP_INI_DIR/conf.d/zz-portal.ini" \
 && sed -ri 's#/var/www/html#/var/www/southomo/public#g' /etc/apache2/sites-available/000-default.conf \
 && printf '<Directory /var/www/southomo/public>\n  AllowOverride All\n  Require all granted\n</Directory>\nServerName localhost\n' > /etc/apache2/conf-enabled/portal.conf
COPY --from=build /src/release/ /opt/release/
RUN mkdir -p /var/www/southomo && unzip -q /opt/release/*.zip -d /var/www/southomo \
 && cd /var/www/southomo && mkdir -p public/uploads storage/app/private storage/logs storage/framework/cache/data storage/framework/sessions storage/framework/views \
 && chown -R www-data:www-data storage bootstrap/cache public/uploads
COPY --from=build /src/deploy/prod-test/entrypoint.sh /usr/local/bin/portal-entrypoint
RUN chmod +x /usr/local/bin/portal-entrypoint
WORKDIR /var/www/southomo
ENTRYPOINT ["portal-entrypoint"]
CMD ["apache2-foreground"]
