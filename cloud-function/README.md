# Tom Yang Bar API - Yandex Cloud Functions

Этот проект содержит API для ресторана Tom Yang Bar, адаптированный для работы на Yandex Cloud Functions.

## 🚀 Быстрый старт

### 1. Установка Yandex CLI

```bash
curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash
```

После установки перезапустите терминал и выполните:

```bash
yc init
```

### 2. Настройка переменных окружения

Скопируйте `env.example` и заполните своими данными:

```bash
cp env.example .env
```

Заполните следующие переменные:
- `SUPABASE_URL` - URL вашего Supabase проекта
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role ключ из Supabase
- `FRONTEND_URL` - URL вашего фронтенда (для CORS)

### 3. Деплой

```bash
./deploy.sh
```

## 📋 Что включает API

### Меню
- `GET /api/menu/dishes` - Получить все блюда
- `GET /api/menu/categories` - Получить категории
- `GET /api/menu/full` - Получить полное меню

### Корзина
- `POST /api/cart/get-or-create` - Получить или создать корзину

### Пользователи
- `POST /api/users/register` - Регистрация
- `POST /api/users/login` - Вход

### Заказы
- `POST /api/orders` - Создать заказ

### Система
- `GET /api/health` - Проверка здоровья API

## 🔧 Ручной деплой

Если автоматический скрипт не работает, можно развернуть вручную:

```bash
# Установить зависимости
npm install --production

# Создать архив
zip -r function.zip . -x "*.git*" "deploy.sh" "*.md"

# Создать функцию
yc serverless function create --name tomyangbar-api

# Загрузить код
yc serverless function version create \
    --function-name tomyangbar-api \
    --runtime nodejs20 \
    --entrypoint index.handler \
    --memory 256m \
    --execution-timeout 10s \
    --source-path ./function.zip \
    --environment SUPABASE_URL="ваш-url" \
    --environment SUPABASE_SERVICE_ROLE_KEY="ваш-ключ"

# Создать HTTP триггер
yc serverless trigger create http \
    --name tomyangbar-trigger \
    --function-name tomyangbar-api \
    --invoke-function-with-iam \
    --auth-anonymous
```

## 📊 Мониторинг

После деплоя вы получите URL вида:
```
https://functions.yandexcloud.net/d4e123abxxxxxx
```

Этот URL нужно будет использовать в вашем фронтенде для API запросов.

## 🔍 Отладка

Для просмотра логов функции:

```bash
yc serverless function logs --name tomyangbar-api
```

## 💡 Полезные команды

```bash
# Получить информацию о функции
yc serverless function get --name tomyangbar-api

# Получить URL триггера
yc serverless trigger get --name tomyangbar-trigger

# Удалить функцию
yc serverless function delete --name tomyangbar-api

# Удалить триггер
yc serverless trigger delete --name tomyangbar-trigger
```
