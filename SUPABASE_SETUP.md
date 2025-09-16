# Настройка Supabase для Tom Yang Bar

## Шаги по настройке

### 1. Создание схемы базы данных

1. Откройте ваш проект Supabase: https://fguwtuaxtjrojgjnxchv.supabase.co
2. Перейдите в раздел "SQL Editor"
3. Скопируйте и выполните содержимое файла `supabase-schema.sql`

### 2. Настройка переменных окружения

Создайте файл `.env.local` в корне проекта со следующим содержимым:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://fguwtuaxtjrojgjnxchv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZndXd0dWF4dGpyb2pnam54Y2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDg0ODUsImV4cCI6MjA3MzYyNDQ4NX0.-NyA5IJkBuYG-qMABFNQ5KFw38q8RHdg182Eswwddlw

# Yandex Maps (если используется)
VITE_YANDEX_MAPS_API_KEY=your_yandex_maps_api_key

# Telegram Bot (если используется)
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
VITE_TELEGRAM_CHAT_ID=your_telegram_chat_id
```

### 3. Настройка Row Level Security (RLS)

RLS политики уже включены в схему базы данных. Они обеспечивают:

- Пользователи могут видеть и редактировать только свои данные
- Анонимные пользователи могут создавать заказы
- Корзины привязаны к пользователям или сессиям

### 4. Тестовые данные

В схеме уже включены тестовые пользователи:
- **Админ**: admin@test.com / admin123
- **Пользователь**: user@test.com / user123

### 5. Развертывание на Vercel

1. Убедитесь, что файл `.env.local` содержит правильные переменные
2. Загрузите проект на Vercel
3. В настройках Vercel добавьте переменные окружения:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - Остальные переменные по необходимости

### 6. Проверка работы

После развертывания проверьте:
- Регистрацию новых пользователей
- Авторизацию существующих пользователей
- Создание заказов
- Работу корзины
- Админ-панель

## Структура базы данных

### Таблицы:
- **users** - пользователи системы
- **orders** - заказы
- **order_items** - элементы заказов
- **carts** - корзины (для временного хранения)
- **cart_items** - элементы корзин

### Особенности:
- UUID для всех ID
- Автоматические timestamps
- Row Level Security для безопасности
- Индексы для оптимизации запросов

## Миграция с localStorage

Все данные теперь хранятся в Supabase:
- ✅ Пользователи
- ✅ Заказы
- ✅ Корзины
- ✅ История заказов

localStorage больше не используется для хранения данных, только для:
- Текущая сессия пользователя
- ID сессии корзины для неавторизованных пользователей

## Поддержка RU доменов

Supabase полностью поддерживает RU домены и работает без ограничений в России.

## Безопасность

- Пароли хранятся в открытом виде (для тестирования)
- В продакшене рекомендуется использовать хеширование паролей
- RLS политики защищают данные пользователей
- API ключи должны быть скрыты в переменных окружения
