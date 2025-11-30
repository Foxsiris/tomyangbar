#!/bin/bash

# Скрипт для настройки HTTPS без домена (с самоподписанным сертификатом)
# Использование: ./setup-https-no-domain.sh [IP_адрес]

set -e

IP_OR_HOST=${1:-localhost}

echo "🔒 Настройка HTTPS без домена (самоподписанный сертификат)"
echo "Использование IP/хост: $IP_OR_HOST"
echo ""

# Проверка, что мы в правильной директории
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Ошибка: Файл docker-compose.yml не найден"
    echo "Убедитесь, что вы находитесь в корне проекта"
    exit 1
fi

# Остановка контейнеров
echo "📦 Остановка контейнеров..."
docker-compose down 2>/dev/null || true

# Генерация самоподписанного сертификата
echo "🔐 Генерация самоподписанного SSL сертификата..."
./generate-self-signed-cert.sh "$IP_OR_HOST"

# Обновление .env файла
if [ -f ".env" ]; then
    echo "📝 Обновление .env файла..."
    # Определяем URL
    if [ "$IP_OR_HOST" != "localhost" ]; then
        FRONTEND_URL="https://$IP_OR_HOST"
    else
        FRONTEND_URL="https://localhost"
    fi
    
    # Заменяем FRONTEND_URL на HTTPS версию
    if grep -q "FRONTEND_URL=" .env; then
        sed -i.bak "s|FRONTEND_URL=.*|FRONTEND_URL=$FRONTEND_URL|" .env
        echo "✅ FRONTEND_URL обновлен на $FRONTEND_URL"
    else
        echo "FRONTEND_URL=$FRONTEND_URL" >> .env
        echo "✅ FRONTEND_URL добавлен в .env"
    fi
else
    echo "⚠️  Файл .env не найден. Создайте его вручную с FRONTEND_URL=https://$IP_OR_HOST"
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
echo "📋 Важная информация:"
echo "  - Проект доступен по: https://$IP_OR_HOST"
echo "  - Браузер покажет предупреждение о безопасности (это нормально)"
echo "  - Нажмите 'Продолжить' или 'Advanced -> Proceed to site'"
echo ""
echo "⚠️  Самоподписанный сертификат не подходит для продакшена с реальными пользователями"
echo "   Для продакшена рекомендуется использовать домен с Let's Encrypt"
echo ""

