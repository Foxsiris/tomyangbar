#!/bin/bash

# Скрипт для деплоя Tom Yang Bar API на Yandex Cloud Functions
# Использование: ./deploy.sh

set -e

echo "🚀 Начинаем деплой Tom Yang Bar API на Yandex Cloud Functions..."

# Проверяем наличие Yandex CLI
if ! command -v yc &> /dev/null; then
    echo "❌ Yandex CLI не установлен. Установите его:"
    echo "curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash"
    exit 1
fi

# Проверяем авторизацию
if ! yc config list &> /dev/null; then
    echo "❌ Не авторизованы в Yandex CLI. Выполните: yc init"
    exit 1
fi

# Настройки
FUNCTION_NAME="tomyangbar-api"
TRIGGER_NAME="tomyangbar-trigger"
RUNTIME="nodejs20"
MEMORY="256m"
TIMEOUT="10s"

echo "📦 Устанавливаем зависимости..."
cd "$(dirname "$0")"
npm install --production

echo "🗜️ Создаем архив функции..."
zip -r function.zip . -x "*.git*" "deploy.sh" "*.md"

echo "🔧 Создаем функцию (если не существует)..."
if ! yc serverless function get --name $FUNCTION_NAME &> /dev/null; then
    echo "Создаем новую функцию..."
    yc serverless function create --name $FUNCTION_NAME
else
    echo "Функция уже существует, обновляем..."
fi

echo "📤 Загружаем код в функцию..."
yc serverless function version create \
    --function-name $FUNCTION_NAME \
    --runtime $RUNTIME \
    --entrypoint index.handler \
    --memory $MEMORY \
    --execution-timeout $TIMEOUT \
    --source-path ./function.zip \
    --environment SUPABASE_URL="$SUPABASE_URL" \
    --environment SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
    --environment FRONTEND_URL="$FRONTEND_URL"

echo "🌐 Создаем HTTP триггер (если не существует)..."
if ! yc serverless trigger get --name $TRIGGER_NAME &> /dev/null; then
    echo "Создаем новый триггер..."
    yc serverless trigger create http \
        --name $TRIGGER_NAME \
        --function-name $FUNCTION_NAME \
        --invoke-function-with-iam \
        --auth-anonymous
else
    echo "Триггер уже существует..."
fi

echo "🧹 Очищаем временные файлы..."
rm -f function.zip

echo "✅ Деплой завершен!"
echo ""
echo "📋 Информация о функции:"
yc serverless function get --name $FUNCTION_NAME

echo ""
echo "🔗 URL триггера:"
yc serverless trigger get --name $TRIGGER_NAME --format json | jq -r '.http_invoke_url'

echo ""
echo "🎉 Твой API готов к использованию!"
echo "💡 Не забудь обновить URL в фронтенде на полученный адрес"
