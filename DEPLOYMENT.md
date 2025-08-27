# Инструкции по развертыванию Tom Yang Bar

## 🚀 Развертывание на Vercel

1. **Подготовка проекта:**
   ```bash
   npm run build
   ```

2. **Установка Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

3. **Развертывание:**
   ```bash
   vercel
   ```

4. **Настройка переменных окружения (опционально):**
   - Создайте файл `.env.production`
   - Добавьте необходимые переменные

## 🌐 Развертывание на Netlify

1. **Подготовка проекта:**
   ```bash
   npm run build
   ```

2. **Загрузка в Netlify:**
   - Перетащите папку `dist` в Netlify
   - Или подключите GitHub репозиторий

3. **Настройка:**
   - Build command: `npm run build`
   - Publish directory: `dist`

## 📦 Развертывание на GitHub Pages

1. **Добавьте в package.json:**
   ```json
   {
     "homepage": "https://yourusername.github.io/tomyangbar",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

2. **Установите gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Развертывание:**
   ```bash
   npm run deploy
   ```

## 🔧 Настройка домена

1. **Покупка домена:**
   - Рекомендуемые регистраторы: Namecheap, GoDaddy, Google Domains

2. **Настройка DNS:**
   - Добавьте CNAME запись
   - Укажите ваш хостинг

3. **SSL сертификат:**
   - Большинство хостингов предоставляют бесплатный SSL

## 📱 PWA настройка

1. **Создайте manifest.json:**
   ```json
   {
     "name": "Tom Yang Bar",
     "short_name": "TYB",
     "description": "Ресторан азиатской кухни",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#ffffff",
     "theme_color": "#dc2626",
     "icons": [
       {
         "src": "/icon-192.png",
         "sizes": "192x192",
         "type": "image/png"
       },
       {
         "src": "/icon-512.png",
         "sizes": "512x512",
         "type": "image/png"
       }
     ]
   }
   ```

2. **Добавьте service worker для офлайн работы**

## 🔍 SEO оптимизация

1. **Мета-теги:**
   - Добавьте title, description, keywords
   - Настройте Open Graph теги

2. **Sitemap:**
   - Создайте sitemap.xml
   - Добавьте robots.txt

3. **Структурированные данные:**
   - Добавьте JSON-LD разметку для ресторана

## 📊 Аналитика

1. **Google Analytics:**
   ```html
   <!-- Global site tag (gtag.js) - Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'GA_MEASUREMENT_ID');
   </script>
   ```

2. **Yandex Metrika:**
   ```html
   <!-- Yandex.Metrika counter -->
   <script type="text/javascript" >
      (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
      (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
      ym(XXXXXX, "init", {
           clickmap:true,
           trackLinks:true,
           accurateTrackBounce:true
      });
   </script>
   ```

## 🔒 Безопасность

1. **HTTPS:**
   - Обязательно используйте HTTPS
   - Настройте HSTS заголовки

2. **CSP (Content Security Policy):**
   ```html
   <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;">
   ```

3. **Защита от XSS:**
   - Используйте React встроенную защиту
   - Валидируйте все пользовательские данные

## 📈 Мониторинг

1. **Uptime мониторинг:**
   - UptimeRobot
   - Pingdom
   - StatusCake

2. **Логирование ошибок:**
   - Sentry
   - LogRocket
   - Bugsnag

## 🚀 Оптимизация производительности

1. **Сжатие изображений:**
   ```bash
   npm install --save-dev imagemin imagemin-webp
   ```

2. **Lazy loading:**
   - Используйте React.lazy для компонентов
   - Добавьте loading="lazy" для изображений

3. **Кэширование:**
   - Настройте кэширование статических файлов
   - Используйте Service Worker для кэширования

## 📞 Поддержка

Для получения поддержки по развертыванию:
- Email: support@tomyangbar.ru
- Телефон: +7 (927) 112-65-00
- Документация: https://docs.tomyangbar.ru
