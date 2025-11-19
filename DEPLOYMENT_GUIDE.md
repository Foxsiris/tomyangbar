# 🚀 Руководство по развертыванию Tom Yang Bar

## 📋 Предварительные требования

- Node.js 18+ 
- npm или yarn
- Git
- Аккаунт на платформе развертывания

## 🔧 Подготовка к развертыванию

### 1. Сборка проекта

```bash
# Установка зависимостей
npm install

# Сборка для продакшена
npm run build

# Проверка сборки
npm run preview
```

### 2. Проверка файлов

После сборки в папке `dist/` должны появиться:
- `index.html` - главная страница
- `assets/` - папка с JS и CSS файлами
- Другие статические ресурсы

## 🌐 Развертывание на Vercel (Рекомендуется)

### 1. Подготовка

```bash
# Установка Vercel CLI
npm i -g vercel

# Вход в аккаунт
vercel login
```

### 2. Развертывание

```bash
# Автоматическое развертывание
vercel

# Или с указанием настроек
vercel --prod
```

### 3. Настройка домена

1. Перейдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите проект
3. Перейдите в Settings → Domains
4. Добавьте ваш домен

### 4. Переменные окружения (если нужны)

```bash
# В Vercel Dashboard → Settings → Environment Variables
NODE_ENV=production
VITE_API_URL=https://your-api.com
```

## 🌐 Развертывание на Netlify

### 1. Через Netlify CLI

```bash
# Установка Netlify CLI
npm install -g netlify-cli

# Вход в аккаунт
netlify login

# Развертывание
netlify deploy --prod --dir=dist
```

### 2. Через Drag & Drop

1. Перейдите на [netlify.com](https://netlify.com)
2. Перетащите папку `dist/` в область развертывания
3. Получите URL вашего сайта

### 3. Настройка домена

1. В Netlify Dashboard → Site settings → Domain management
2. Добавьте ваш домен
3. Настройте DNS записи

## 🌐 Развертывание на GitHub Pages

### 1. Подготовка репозитория

```bash
# Добавьте в package.json
{
  "homepage": "https://yourusername.github.io/tomyangbar",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}

# Установка gh-pages
npm install --save-dev gh-pages
```

### 2. Развертывание

```bash
# Сборка и развертывание
npm run deploy
```

### 3. Настройка

1. В GitHub репозитории → Settings → Pages
2. Выберите источник: Deploy from a branch
3. Выберите ветку: gh-pages

## 🌐 Развертывание на обычном VPS

### 1. Подготовка сервера

```bash
# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка nginx
sudo apt update
sudo apt install nginx
```

### 2. Загрузка файлов

```bash
# Клонирование репозитория
git clone https://github.com/yourusername/tomyangbar.git
cd tomyangbar

# Сборка проекта
npm install
npm run build
```

### 3. Настройка nginx

```nginx
# /etc/nginx/sites-available/tomyangbar
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/tomyangbar/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Кэширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

### 4. Активация сайта

```bash
# Создание символической ссылки
sudo ln -s /etc/nginx/sites-available/tomyangbar /etc/nginx/sites-enabled/

# Проверка конфигурации
sudo nginx -t

# Перезапуск nginx
sudo systemctl restart nginx
```

## 🔒 Настройка HTTPS

### 1. Let's Encrypt (бесплатно)

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Автоматическое обновление
sudo crontab -e
# Добавьте строку:
0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Настройка редиректа

```nginx
# Автоматический редирект с HTTP на HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## 📊 Мониторинг и аналитика

### 1. Google Analytics

```html
<!-- Добавьте в index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 2. Мониторинг производительности

```bash
# Lighthouse CI
npm install -g @lhci/cli

# Запуск проверки
lhci autorun
```

## 🔧 Оптимизация производительности

### 1. Сжатие изображений

```bash
# Установка imagemin
npm install --save-dev imagemin imagemin-mozjpeg imagemin-pngquant

# Создайте скрипт для оптимизации
node scripts/optimize-images.js
```

### 2. Кэширование

```nginx
# Настройка кэширования в nginx
location ~* \.(js|css)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* \.(png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public";
}
```

### 3. CDN

Рекомендуется использовать CDN для статических файлов:
- Cloudflare
- AWS CloudFront
- Vercel Edge Network

## 🚨 Устранение неполадок

### Проблема: Белая страница
**Решение:**
```bash
# Проверьте консоль браузера
# Убедитесь, что все файлы загружаются
# Проверьте настройки nginx
sudo nginx -t
```

### Проблема: 404 ошибки при обновлении страницы
**Решение:**
```nginx
# Добавьте в nginx конфигурацию
location / {
    try_files $uri $uri/ /index.html;
}
```

### Проблема: Медленная загрузка
**Решение:**
```bash
# Включите gzip сжатие
# Оптимизируйте изображения
# Используйте CDN
```

## 📞 Поддержка

Если у вас возникли проблемы:

1. Проверьте логи сервера
2. Убедитесь, что все зависимости установлены
3. Проверьте конфигурацию nginx
4. Обратитесь к документации платформы

## 🎉 Готово!

После успешного развертывания ваш сайт будет доступен по адресу:
- **Vercel**: https://your-project.vercel.app
- **Netlify**: https://your-site.netlify.app
- **GitHub Pages**: https://yourusername.github.io/tomyangbar
- **VPS**: https://yourdomain.com

---

**Удачного развертывания! 🚀**
