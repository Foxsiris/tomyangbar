#!/bin/bash

# Скрипт для генерации самоподписанного SSL сертификата
# Использование: ./generate-self-signed-cert.sh [IP_или_домен]

set -e

DOMAIN_OR_IP=${1:-localhost}

echo "🔒 Генерация самоподписанного SSL сертификата для: $DOMAIN_OR_IP"
echo ""

# Создание директории для SSL
mkdir -p ssl

# Генерация приватного ключа
echo "📝 Генерация приватного ключа..."
openssl genrsa -out ssl/privkey.pem 2048

# Генерация сертификата
echo "📝 Генерация сертификата..."
openssl req -new -x509 -key ssl/privkey.pem -out ssl/fullchain.pem -days 365 \
    -subj "/C=RU/ST=State/L=City/O=Organization/CN=$DOMAIN_OR_IP" \
    -addext "subjectAltName=IP:$DOMAIN_OR_IP,DNS:$DOMAIN_OR_IP,DNS:localhost" 2>/dev/null || \
openssl req -new -x509 -key ssl/privkey.pem -out ssl/fullchain.pem -days 365 \
    -subj "/C=RU/ST=State/L=City/O=Organization/CN=$DOMAIN_OR_IP"

# Установка прав доступа
chmod 644 ssl/fullchain.pem
chmod 600 ssl/privkey.pem

echo ""
echo "✅ Самоподписанный сертификат создан!"
echo ""
echo "📋 Файлы:"
echo "  - ssl/fullchain.pem"
echo "  - ssl/privkey.pem"
echo ""
echo "⚠️  ВАЖНО: Браузеры будут показывать предупреждение о безопасности"
echo "   Это нормально для самоподписанных сертификатов."
echo "   Вы можете нажать 'Продолжить' или 'Advanced -> Proceed'"
echo ""
echo "🚀 Теперь запустите:"
echo "   docker-compose -f docker-compose.https.yml up -d --build"
echo ""

