# ✅ Чек-лист для деплоя Tom Yang Bar на Vercel

## 🚀 Что уже сделано:
- ✅ Код запушен в GitHub репозиторий
- ✅ Проект успешно собирается (`npm run build`)
- ✅ Конфигурация Vercel настроена (`vercel.json`)
- ✅ Supabase интеграция готова
- ✅ Все зависимости установлены

## 🔧 Что нужно настроить в Vercel:

### 1. Переменные окружения
В настройках проекта Vercel добавьте:

```
VITE_SUPABASE_URL=https://fguwtuaxtjrojgjnxchv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZndXd0dWF4dGpyb2pnam54Y2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDg0ODUsImV4cCI6MjA3MzYyNDQ4NX0.-NyA5IJkBuYG-qMABFNQ5KFw38q8RHdg182Eswwddlw
```

### 2. Настройки сборки Vercel
Vercel автоматически определит:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Подключение к GitHub
1. Зайдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Нажмите "New Project"
3. Выберите репозиторий `Foxsiris/tomyangbar`
4. Vercel автоматически импортирует настройки

## 🗄️ Настройка Supabase:

### 1. Выполните SQL схему
В Supabase SQL Editor выполните содержимое файла `supabase-schema.sql`

### 2. Проверьте RLS политики
Убедитесь, что Row Level Security включен для всех таблиц

### 3. Создайте тестовые данные
Выполните SQL из файла `complete-menu-data.sql`

## 🧪 Тестирование после деплоя:

### Основной функционал:
- [ ] Загрузка главной страницы
- [ ] Просмотр меню
- [ ] Добавление товаров в корзину
- [ ] Регистрация пользователя
- [ ] Авторизация пользователя
- [ ] Создание заказа

### Админ-панель:
- [ ] Доступ к админ-панели
- [ ] Просмотр заказов
- [ ] Обновление статусов заказов

## 🔗 Полезные ссылки:
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [GitHub Repository](https://github.com/Foxsiris/tomyangbar)

## 📞 Поддержка:
При возникновении проблем проверьте:
1. Логи в Vercel Dashboard
2. Логи в Supabase Dashboard
3. Переменные окружения
4. Настройки CORS в Supabase
