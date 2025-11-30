# 🔒 Быстрая настройка HTTPS

## Что нужно перед началом

1. ✅ Домен (например, `example.com`), который указывает на IP вашего сервера
2. ✅ SSH доступ к серверу
3. ✅ Проект уже развернут и работает на HTTP

> **Нет домена?** См. [HTTPS без домена](./HTTPS_NO_DOMAIN.md) для использования самоподписанного сертификата.

## Автоматическая настройка (1 команда)

```bash
# На сервере, в папке проекта
./setup-https.sh your-domain.com
```

Готово! Проект теперь работает на HTTPS.

## Ручная настройка (пошагово)

### 1. Подключитесь к серверу
```bash
ssh user@your-server
cd /path/to/tomyangbar
```

### 2. Остановите контейнеры
```bash
docker-compose down
```

### 3. Установите certbot (если еще не установлен)
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install certbot

# CentOS/RHEL
sudo yum install certbot
```

### 4. Получите SSL сертификат
```bash
# Замените your-domain.com на ваш домен
sudo certbot certonly --standalone -d your-domain.com
```

### 5. Скопируйте сертификаты
```bash
mkdir -p ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/
sudo chmod 644 ./ssl/fullchain.pem
sudo chmod 600 ./ssl/privkey.pem
sudo chown $USER:$USER ./ssl/*
```

### 6. Обновите .env файл
```bash
nano .env
```

Измените строку:
```env
FRONTEND_URL=https://your-domain.com
```

### 7. Переключитесь на HTTPS конфигурацию
```bash
# Создайте резервную копию
cp docker-compose.yml docker-compose.http.yml

# Используйте HTTPS версию
cp docker-compose.https.yml docker-compose.yml
```

### 8. Запустите проект
```bash
docker-compose up -d --build
```

### 9. Проверьте работу
Откройте в браузере: `https://your-domain.com`

## Автообновление сертификатов

Сертификаты Let's Encrypt действуют 90 дней. Для автоматического обновления:

```bash
sudo crontab -e
```

Добавьте строку (замените пути и домен):
```cron
0 3 * * * cd /path/to/tomyangbar && certbot renew --quiet && cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/ && cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/ && docker-compose restart frontend
```

## Откат на HTTP (если нужно)

```bash
docker-compose down
cp docker-compose.http.yml docker-compose.yml
docker-compose up -d
```

## Проблемы?

### "Port 80 is already in use"
Остановите контейнеры перед получением сертификата:
```bash
docker-compose down
```

### "Failed to obtain certificate"
Проверьте:
- Домен указывает на IP сервера: `dig your-domain.com`
- Порт 80 открыт: `sudo ufw allow 80/tcp`

### "SSL certificate not found"
Проверьте файлы:
```bash
ls -la ssl/
# Должны быть: fullchain.pem и privkey.pem
```

## Подробная документация

См. [HTTPS_SETUP.md](./HTTPS_SETUP.md) для детальной информации.

