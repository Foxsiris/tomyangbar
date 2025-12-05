#!/bin/bash

# Скрипт для настройки HTTPS для Tom Yang Bar
# Использование: ./setup-https.sh your-domain.com

set -e

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "❌ Ошибка: Укажите домен"
    echo "Использование: ./setup-https.sh your-domain.com"
    exit 1
fi

echo "🔒 Настройка HTTPS для домена: $DOMAIN"
echo ""

# Проверка, что мы в правильной директории
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Ошибка: Файл docker-compose.yml не найден"
    echo "Убедитесь, что вы находитесь в корне проекта"
    exit 1
fi

# Остановка контейнеров
echo "📦 Остановка контейнеров..."
docker-compose down

# Проверка установки certbot
if ! command -v certbot &> /dev/null; then
    echo "⚠️  Certbot не установлен. Установка..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y certbot
    elif command -v yum &> /dev/null; then
        sudo yum install -y certbot
    else
        echo "❌ Не удалось установить certbot автоматически"
        echo "Установите certbot вручную и запустите скрипт снова"
        exit 1
    fi
fi

# Проверка DNS перед получением сертификата
echo "🔍 Проверка DNS настроек..."
if [ -f "check-dns.sh" ]; then
    ./check-dns.sh "$DOMAIN" || {
        echo ""
        echo "❌ DNS не настроен правильно. Исправьте DNS записи и попробуйте снова."
        echo "📖 Инструкция: см. DNS_SETUP.md"
        exit 1
    }
    echo ""
else
    echo "⚠️  Скрипт check-dns.sh не найден, пропускаем проверку DNS"
    echo "   Убедитесь, что домен $DOMAIN указывает на IP этого сервера"
    echo ""
fi

# Получение сертификата
echo "🔐 Получение SSL сертификата от Let's Encrypt..."
echo "⚠️  Certbot может запросить email для уведомлений о истечении сертификата"
sudo certbot certonly --standalone -d "$DOMAIN" || {
    echo ""
    echo "❌ Не удалось получить сертификат"
    echo ""
    echo "Возможные причины:"
    echo "  1. DNS записи еще не распространились (подождите 5-60 минут)"
    echo "  2. DNS записи настроены неправильно"
    echo "  3. Порт 80 не открыт или занят другим процессом"
    echo "  4. Firewall блокирует порт 80"
    echo ""
    echo "Проверьте:"
    echo "  - DNS: ./check-dns.sh $DOMAIN"
    echo "  - Порт 80: sudo netstat -tulpn | grep :80"
    echo "  - Firewall: sudo ufw status"
    echo ""
    echo "📖 Подробная инструкция: см. DNS_SETUP.md и HTTPS_TROUBLESHOOTING.md"
    exit 1
}

# Создание директории для SSL
echo "📁 Создание директории для SSL сертификатов..."
mkdir -p ssl

# Копирование сертификатов
echo "📋 Копирование сертификатов..."
sudo cp /etc/letsencrypt/live/"$DOMAIN"/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/"$DOMAIN"/privkey.pem ./ssl/

# Установка прав доступа
echo "🔑 Установка прав доступа..."
sudo chmod 644 ./ssl/fullchain.pem
sudo chmod 600 ./ssl/privkey.pem
sudo chown $USER:$USER ./ssl/*

# Обновление .env файла
if [ -f ".env" ]; then
    echo "📝 Обновление .env файла..."
    # Заменяем FRONTEND_URL на HTTPS версию
    if grep -q "FRONTEND_URL=" .env; then
        sed -i.bak "s|FRONTEND_URL=.*|FRONTEND_URL=https://$DOMAIN|" .env
        echo "✅ FRONTEND_URL обновлен на https://$DOMAIN"
    else
        echo "FRONTEND_URL=https://$DOMAIN" >> .env
        echo "✅ FRONTEND_URL добавлен в .env"
    fi
else
    echo "⚠️  Файл .env не найден. Создайте его вручную с FRONTEND_URL=https://$DOMAIN"
fi

# Резервная копия docker-compose.yml
if [ ! -f "docker-compose.http.yml" ]; then
    echo "💾 Создание резервной копии docker-compose.yml..."
    cp docker-compose.yml docker-compose.http.yml
fi

# Использование HTTPS конфигурации
if [ -f "docker-compose.https.yml" ]; then
    echo "🔄 Переключение на HTTPS конфигурацию..."
    cp docker-compose.https.yml docker-compose.yml
else
    echo "⚠️  Файл docker-compose.https.yml не найден"
    echo "Используйте docker-compose.https.yml вручную"
fi

# Запуск контейнеров
echo "🚀 Запуск контейнеров с HTTPS..."
docker-compose up -d --build

echo ""
echo "✅ Настройка HTTPS завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "  1. Откройте в браузере: https://$DOMAIN"
echo "  2. Проверьте, что в адресной строке есть замочек 🔒"
echo ""
echo "🔄 Для автоматического обновления сертификатов добавьте в crontab:"
echo "  0 3 * * * cd $(pwd) && certbot renew --quiet && cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./ssl/ && cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./ssl/ && docker-compose restart frontend"
echo ""

