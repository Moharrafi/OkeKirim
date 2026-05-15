FROM php:8.2-cli

# Install MySQL PDO extension
RUN docker-php-ext-install pdo pdo_mysql

# Create session directory
RUN mkdir -p /tmp/sessions && chmod 777 /tmp/sessions

# Set working directory
WORKDIR /var/www/html

# Copy all files
COPY . /var/www/html/

# Make start script executable
RUN chmod +x /var/www/html/start.sh

CMD ["/var/www/html/start.sh"]
