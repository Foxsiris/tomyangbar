# 🚀 Развертывание Tom Yang Bar на Vercel

## 📋 Предварительные требования

- GitHub аккаунт
- Vercel аккаунт
- Supabase проект
- YooKassa аккаунт (для платежей)
- Yandex Maps API ключ (опционально)
- Telegram бот (опционально, для уведомлений)

## 🔧 Пошаговая инструкция

### 1. Подготовка репозитория

1. Убедитесь, что все изменения закоммичены в GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

### 2. Подключение к Vercel

1. Зайдите на [vercel.com](https://vercel.com)
2. Нажмите "New Project"
3. Выберите ваш GitHub репозиторий `Foxsiris/tomyangbar`
4. Нажмите "Import"

### 3. Настройка переменных окружения

В настройках проекта Vercel добавьте следующие переменные:

#### Обязательные переменные:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
YOOKASSA_SHOP_ID=your-shop-id
YOOKASSA_SECRET_KEY=your-secret-key
```

#### Опциональные переменные:
```
YANDEX_MAPS_API_KEY=your-yandex-maps-api-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
NODE_ENV=production
```

### 4. Настройка Supabase

1. Создайте проект в [Supabase](https://supabase.com)
2. Выполните SQL команды из файла `supabase-schema.sql`
3. Скопируйте URL и Anon Key в переменные окружения Vercel

### 5. Настройка YooKassa

1. Зарегистрируйтесь в [YooKassa](https://yookassa.ru)
2. Получите Shop ID и Secret Key
3. Добавьте их в переменные окружения Vercel

### 6. Настройка Yandex Maps (опционально)

1. Получите API ключ в [Yandex Developer Console](https://developer.tech.yandex.ru/)
2. Добавьте ключ в переменные окружения Vercel

### 7. Настройка Telegram (опционально)

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен бота
3. Узнайте ваш Chat ID
4. Добавьте их в переменные окружения Vercel

## 🎯 Проверка развертывания

После развертывания проверьте:

1. **Основной сайт**: `https://your-project.vercel.app`
2. **API endpoints**:
   - `https://your-project.vercel.app/api/health`
   - `https://your-project.vercel.app/api/check-env`
3. **Платежи**: Протестируйте создание заказа
4. **Карты**: Проверьте автокомплит адресов (если настроен)

## 🔧 Настройки проекта

### Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Environment Variables
Все переменные должны быть добавлены в настройках проекта Vercel.

## 🚨 Важные замечания

1. **Безопасность**: Никогда не коммитьте реальные ключи в код
2. **Тестовый режим**: YooKassa работает в тестовом режиме по умолчанию
3. **CORS**: API endpoints настроены для работы с фронтендом
4. **Кэширование**: Статические файлы кэшируются на 1 год

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в Vercel Dashboard
2. Убедитесь, что все переменные окружения настроены
3. Проверьте статус API endpoints

## 🎉 Готово!

После успешного развертывания ваш сайт будет доступен по адресу:
`https://your-project.vercel.app`

---

**Удачного развертывания! 🚀**
