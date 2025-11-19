# 🐳 Docker Deployment Guide

Инструкция по развертыванию проекта Tom Yang Bar на VPS с помощью Docker Compose.

## 📋 Требования

- VPS с установленными Docker и Docker Compose
- Минимум 2GB RAM
- Минимум 10GB свободного места на диске

## 🚀 Быстрый старт

### 1. Подготовка сервера

Установите Docker и Docker Compose (если еще не установлены):

```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Клонирование проекта

```bash
git clone <your-repo-url> tomyangbar
cd tomyangbar
```

### 3. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```bash
cp .env.example .env
nano .env
```

Заполните переменные:

```env
# Supabase Configuration (для бэкенда)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Supabase Configuration (для фронтенда - Vite переменные)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT Secret (сгенерируйте случайную строку)
JWT_SECRET=your_very_secure_jwt_secret_key_min_32_chars

# Frontend URL (замените на ваш домен или IP)
FRONTEND_URL=http://your-domain.com
# или для IP:
# FRONTEND_URL=http://YOUR_IP_ADDRESS
```

**Важно**: 
- `SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY` используются бэкендом
- `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` используются фронтендом (встраиваются в сборку)

### 4. Сборка и запуск

```bash
# Сборка образов
docker-compose build

# Запуск контейнеров
docker-compose up -d

# Просмотр логов
docker-compose logs -f
```

### 5. Проверка работы

- Фронтенд: `http://YOUR_IP_ADDRESS` или `http://your-domain.com`
- Бэкенд API: `http://YOUR_IP_ADDRESS/api/health`
- Health check: `http://YOUR_IP_ADDRESS/health`

## 🔧 Управление контейнерами

```bash
# Остановка
docker-compose down

# Перезапуск
docker-compose restart

# Просмотр статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f [service_name]

# Пересборка после изменений
docker-compose up -d --build
```

## 📁 Структура

- **Фронтенд**: React + Vite, работает на порту 80 через nginx
- **Бэкенд**: Express.js, работает на порту 3001
- **Nginx**: Проксирует `/api` запросы к бэкенду

## 🔒 Безопасность

1. **Firewall**: Настройте firewall для открытия только необходимых портов:
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp  # если используете SSL
   sudo ufw enable
   ```

2. **SSL/HTTPS**: Рекомендуется настроить SSL сертификат через Let's Encrypt:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

3. **Переменные окружения**: Никогда не коммитьте `.env` файл в git!

## 🐛 Решение проблем

### Контейнеры не запускаются

```bash
# Проверьте логи
docker-compose logs

# Проверьте переменные окружения
docker-compose config
```

### Проблемы с портами

Если порт 80 занят, измените в `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Внешний:Внутренний
```

### Проблемы с правами доступа

```bash
# Для директории uploads
sudo chown -R 1000:1000 backend/uploads
```

### Очистка и пересборка

```bash
# Остановка и удаление контейнеров
docker-compose down

# Удаление образов
docker-compose down --rmi all

# Очистка volumes (осторожно!)
docker-compose down -v

# Полная пересборка
docker-compose build --no-cache
docker-compose up -d
```

## 📊 Мониторинг

```bash
# Использование ресурсов
docker stats

# Логи в реальном времени
docker-compose logs -f frontend
docker-compose logs -f backend
```

## 🔄 Обновление

```bash
# Получите последние изменения
git pull

# Пересоберите и перезапустите
docker-compose up -d --build
```

## 📝 Примечания

- Файлы загружаются в `backend/uploads` и сохраняются через volume
- Все API запросы проксируются через nginx с `/api` на бэкенд
- Фронтенд настроен на использование относительных путей в продакшене

