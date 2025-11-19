# 🚀 Быстрый старт с Docker

## Шаги для развертывания на VPS

### 1. Скопируйте проект на сервер
```bash
git clone <your-repo-url>
cd tomyangbar
```

### 2. Создайте файл `.env`
```bash
nano .env
```

Добавьте следующие переменные:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_very_secure_jwt_secret_key
FRONTEND_URL=http://YOUR_IP_OR_DOMAIN
```

### 3. Запустите проект
```bash
docker-compose build
docker-compose up -d
```

### 4. Проверьте работу
- Откройте в браузере: `http://YOUR_IP_OR_DOMAIN`
- Проверьте API: `http://YOUR_IP_OR_DOMAIN/api/health`

### Полезные команды
```bash
# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Перезапуск
docker-compose restart

# Пересборка после изменений
docker-compose up -d --build
```

Подробная документация: [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)

