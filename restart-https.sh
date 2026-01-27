#!/bin/bash
# Перезапуск сайта с HTTPS после git pull
# Использование: ./restart-https.sh

set -e
cd "$(dirname "$0")"

echo "=========================================="
echo "  Tom Yang Bar — перезапуск с HTTPS"
echo "=========================================="
echo ""

# Проверка SSL
if [ ! -f ssl/fullchain.pem ] || [ ! -f ssl/privkey.pem ]; then
  echo "[ОШИБКА] Нет SSL-сертификатов!"
  echo "Нужны файлы: ssl/fullchain.pem и ssl/privkey.pem"
  echo ""
  echo "Если сертификаты в certbot, выполните:"
  echo "  sudo cp /etc/letsencrypt/live/ВАШ_ДОМЕН/fullchain.pem ssl/"
  echo "  sudo cp /etc/letsencrypt/live/ВАШ_ДОМЕН/privkey.pem ssl/"
  echo "  sudo chown \$(whoami): ssl/*.pem"
  echo ""
  echo "Если сертификатов нет — получите через certbot, затем повторите скрипт."
  exit 1
fi

echo "[OK] SSL-сертификаты найдены"
echo ""

# Остановка обычного compose (если был запущен)
echo "Останавливаем контейнеры (если запущены)..."
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose.https.yml down 2>/dev/null || true
echo ""

# Сборка и запуск с HTTPS
echo "Сборка и запуск с HTTPS..."
docker-compose -f docker-compose.https.yml up -d --build
echo ""

echo "=========================================="
echo "  Готово. Сайт с HTTPS должен быть доступен."
echo "  Проверка: curl -sI https://ваш-домен.ru/"
echo "=========================================="
