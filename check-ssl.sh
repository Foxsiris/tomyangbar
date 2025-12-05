#!/bin/bash

# Скрипт для проверки SSL сертификата
# Использование: ./check-ssl.sh [domain_or_ip]

set -e

DOMAIN_OR_IP=${1:-localhost}

echo "🔍 Проверка SSL конфигурации для: $DOMAIN_OR_IP"
echo ""

# Проверка существования сертификатов
echo "📋 Проверка файлов сертификатов..."
if [ -f "ssl/fullchain.pem" ] && [ -f "ssl/privkey.pem" ]; then
    echo "✅ Сертификаты найдены"
    
    # Проверка содержимого сертификата
    echo ""
    echo "📜 Информация о сертификате:"
    openssl x509 -in ssl/fullchain.pem -text -noout | grep -E "(Subject:|Issuer:|Not Before|Not After|DNS:|IP Address:)" || true
    
    echo ""
    echo "🔐 Проверка приватного ключа..."
    if openssl rsa -in ssl/privkey.pem -check -noout 2>/dev/null; then
        echo "✅ Приватный ключ валиден"
    else
        echo "❌ Ошибка в приватном ключе"
    fi
    
    # Проверка соответствия ключа и сертификата
    echo ""
    echo "🔗 Проверка соответствия ключа и сертификата..."
    CERT_MODULUS=$(openssl x509 -noout -modulus -in ssl/fullchain.pem | openssl md5)
    KEY_MODULUS=$(openssl rsa -noout -modulus -in ssl/privkey.pem | openssl md5)
    
    if [ "$CERT_MODULUS" == "$KEY_MODULUS" ]; then
        echo "✅ Ключ соответствует сертификату"
    else
        echo "❌ Ключ НЕ соответствует сертификату!"
        echo "   Нужно пересоздать сертификат"
    fi
    
else
    echo "❌ Сертификаты не найдены в директории ssl/"
    echo "   Создайте их с помощью: ./generate-self-signed-cert.sh $DOMAIN_OR_IP"
    exit 1
fi

# Проверка конфигурации nginx
echo ""
echo "📋 Проверка конфигурации nginx..."
if [ -f "nginx-https.conf" ]; then
    echo "✅ nginx-https.conf найден"
    
    # Проверка путей к сертификатам
    if grep -q "/etc/nginx/ssl/fullchain.pem" nginx-https.conf; then
        echo "✅ Путь к сертификату указан правильно"
    else
        echo "⚠️  Путь к сертификату не найден в конфигурации"
    fi
else
    echo "⚠️  nginx-https.conf не найден"
fi

# Проверка docker-compose
echo ""
echo "📋 Проверка docker-compose конфигурации..."
if [ -f "docker-compose.yml" ]; then
    if grep -q "443:443" docker-compose.yml; then
        echo "✅ Порт 443 настроен"
    else
        echo "⚠️  Порт 443 не настроен в docker-compose.yml"
    fi
    
    if grep -q "./ssl:/etc/nginx/ssl" docker-compose.yml; then
        echo "✅ Монтирование SSL директории настроено"
    else
        echo "⚠️  Монтирование SSL директории не настроено"
    fi
else
    echo "⚠️  docker-compose.yml не найден"
fi

# Проверка контейнера
echo ""
echo "🐳 Проверка контейнера..."
if docker ps | grep -q "tomyangbar-frontend"; then
    echo "✅ Контейнер frontend запущен"
    
    # Проверка логов на ошибки SSL
    echo ""
    echo "📋 Последние ошибки в логах (если есть):"
    docker logs tomyangbar-frontend 2>&1 | grep -i "ssl\|certificate\|error" | tail -5 || echo "   Ошибок не найдено"
else
    echo "⚠️  Контейнер frontend не запущен"
fi

echo ""
echo "✅ Проверка завершена"
echo ""
echo "💡 Если сертификат самоподписанный, браузер будет показывать предупреждение"
echo "   Это нормально - нажмите 'Продолжить' или 'Advanced -> Proceed'"






