# Чеклист: запуск сайта после пересоздания контейнеров

## ⚠️ HTTPS: после git pull всегда поднимайте через https-конфиг

Команда **`docker-compose up -d`** поднимает только HTTP (порт 80).  
Для **https://** (как tomyangbarnew.ru) нужна другая команда:

```bash
docker-compose -f docker-compose.https.yml up -d --build
```

Или скрипт: `./restart-https.sh` (см. раздел 3 ниже).

---

## Почему сайт не поднялся на домене

После `docker-compose down` / удаления контейнеров и `docker-compose build & docker-compose up -d` часто ломается одно из следующего.

---

## 1. Команда запуска

**Ошибка:** `docker-compose build & docker-compose up -d`  
`&` запускает сборку в фоне, и `up -d` может выполниться до окончания `build`.

**Правильно:**

```bash
# Вариант 1: по шагам
docker-compose build
docker-compose up -d

# Вариант 2: одной командой
docker-compose up -d --build
```

---

## 2. Файл `.env` в корне проекта

Docker Compose подставляет переменные из **корневого** `.env`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `JWT_SECRET`
- `FRONTEND_URL`

Если `.env` в корне нет или он пустой — фронт может не собраться или бэкенд не подключится к БД.

**Проверка:**

```bash
ls -la .env
cat .env   # не показывайте вывод посторонним
```

**Если `.env` нет — создать и заполнить:**

```bash
nano .env
```

Минимум:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
JWT_SECRET=длинная_случайная_строка_минимум_32_символа
FRONTEND_URL=https://ваш-домен.ru
```

Сохранить (Ctrl+O, Enter, Ctrl+X), затем пересобрать и поднять:

```bash
docker-compose up -d --build
```

---

## 3. HTTP или HTTPS — важно не перепутать

**Если сайт должен открываться по https:// (как tomyangbarnew.ru):**

- Команда **`docker-compose up -d`** поднимает только HTTP (порт 80).  
  После неё https:// не будет работать.

- Для HTTPS всегда нужно использовать **отдельный файл** и явно указывать его:

```bash
docker-compose -f docker-compose.https.yml up -d --build
```

Либо готовый скрипт (в корне проекта):

```bash
chmod +x restart-https.sh
./restart-https.sh
```

### Что нужно для HTTPS

1. Папка `ssl/` в корне проекта с файлами:
   - `ssl/fullchain.pem`
   - `ssl/privkey.pem`

2. Сертификаты **не хранятся в git** (ssl/ обычно в .gitignore).  
   После `git pull` они должны уже лежать на сервере (скопированы с certbot или с бэкапа).

3. Если папки `ssl/` или файлов в ней нет — скопировать с certbot:

```bash
mkdir -p ~/tomyangbar/ssl
sudo cp /etc/letsencrypt/live/tomyangbarnew.ru/fullchain.pem ~/tomyangbar/ssl/
sudo cp /etc/letsencrypt/live/tomyangbarnew.ru/privkey.pem ~/tomyangbar/ssl/
sudo chown $(whoami): ~/tomyangbar/ssl/*.pem
```

После этого снова запустить:

```bash
cd ~/tomyangbar
./restart-https.sh
# или
docker-compose -f docker-compose.https.yml up -d --build
```

### Вариант A: только HTTP (порт 80)

Если HTTPS не нужен, достаточно:

```bash
docker-compose up -d --build
```

Сайт: `http://ваш-домен.ru`

### Вариант B: HTTPS на домене (рекомендуется для продакшена)

Используйте **только** такой порядок после `git pull`:

```bash
cd ~/tomyangbar
# Проверить наличие ssl/fullchain.pem и ssl/privkey.pem
docker-compose -f docker-compose.https.yml up -d --build
```

---

## 4. Порты 80 и 443

Если 80 или 443 уже заняты (другой nginx, апач, и т.п.), контейнер фронта не поднимется.

**Проверка:**

```bash
sudo ss -tlnp | grep -E ':80 |:443 '
# или
sudo netstat -tlnp | grep -E ':80 |:443 '
```

**Освободить порты:** остановить мешающий сервис или в `docker-compose.yml` поменять маппинг, например `"8080:80"`.

---

## 5. Диагностика: контейнеры и логи

**Статус контейнеров:**

```bash
docker-compose ps
# или для HTTPS:
docker-compose -f docker-compose.https.yml ps
```

**Логи (последние строки):**

```bash
docker-compose logs --tail=100
docker-compose logs --tail=50 frontend
docker-compose logs --tail=50 backend
```

**Если контейнеры не создаются или постоянно перезапускаются:**

```bash
docker-compose logs -f
```

Оставьте вывод включённым на 1–2 минуты и посмотрите, на каком сервисе ошибка (frontend/backend) и что пишет в логах.

---

## 6. Краткая последовательность для «чистого» запуска

Выполнять в каталоге проекта (`~/tomyangbar`):

```bash
cd ~/tomyangbar

# 1. Проверить .env
test -f .env && echo ".env есть" || echo "Создайте .env"

# 2. Остановить и убрать старые контейнеры
docker-compose down
docker-compose -f docker-compose.https.yml down 2>/dev/null

# 3. Запуск без HTTPS (только домен по HTTP)
docker-compose up -d --build

# ИЛИ с HTTPS (если есть ssl/fullchain.pem и ssl/privkey.pem)
# docker-compose -f docker-compose.https.yml up -d --build

# 4. Проверка
docker-compose ps
curl -s -o /dev/null -w "%{http_code}" http://localhost/health
curl -s http://localhost/api/health
```

- `http://localhost/health` и `http://localhost/api/health` должны отдавать 200 и ответ от API.
- На домене будет то же самое, если DNS указывает на этот сервер и файрвол открывает 80/443.

---

## 7. Файрвол (ufw)

Чтобы домен реально открывался снаружи:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
sudo ufw enable   # если ещё не включён
```

---

## 8. DNS

Домен должен указывать на IP вашего VPS:

```bash
# Подставьте ваш домен
dig +short ваш-домен.ru
# или
nslookup ваш-домен.ru
```

Один из полученных IP должен совпадать с IP сервера.

---

Если пришлите вывод команд:

- `docker-compose ps`
- `docker-compose logs --tail=30`
- есть ли у вас в корне `.env` и папка `ssl/`
- по какому адресу хотите заходить (HTTP или HTTPS),

можно будет точно сказать, на каком шаге всё ломается.
