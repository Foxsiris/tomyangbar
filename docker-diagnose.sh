#!/bin/bash
# Скрипт диагностики Docker после перезапуска
# Запуск: chmod +x docker-diagnose.sh && ./docker-diagnose.sh

set -e
cd "$(dirname "$0")"

echo "=========================================="
echo "  Диагностика Docker Tom Yang Bar"
echo "=========================================="
echo ""

echo "1. Проверка .env в корне проекта:"
if [ -f .env ]; then
  echo "   [OK] .env существует"
  echo "   Переменные (без значений):"
  grep -E '^[A-Z_]+=' .env 2>/dev/null | cut -d= -f1 | sed 's/^/     - /' || true
else
  echo "   [ОШИБКА] .env НЕ НАЙДЕН!"
  echo "   Создайте .env с переменными: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,"
  echo "   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, JWT_SECRET, FRONTEND_URL"
fi
echo ""

echo "2. Проверка SSL (для HTTPS):"
if [ -d ssl ]; then
  if [ -f ssl/fullchain.pem ] && [ -f ssl/privkey.pem ]; then
    echo "   [OK] ssl/fullchain.pem и ssl/privkey.pem есть"
  else
    echo "   [ВНИМАНИЕ] Папка ssl есть, но нет fullchain.pem или privkey.pem"
    echo "   Для HTTPS нужны оба файла. Используйте docker-compose.yml без HTTPS."
  fi
else
  echo "   [INFO] Папки ssl нет — используйте docker-compose.yml (только HTTP)"
fi
echo ""

echo "3. Занятость портов 80 и 443:"
if command -v ss &>/dev/null; then
  ss -tlnp 2>/dev/null | grep -E ':80 |:443 ' || echo "   Порты 80/443 свободны"
else
  netstat -tlnp 2>/dev/null | grep -E ':80 |:443 ' || echo "   (ss не найден, проверьте порты вручную)"
fi
echo ""

echo "4. Статус контейнеров (docker-compose):"
docker-compose ps 2>/dev/null || docker compose ps 2>/dev/null || echo "   Не удалось выполнить docker-compose ps"
echo ""

echo "5. Последние логи:"
docker-compose logs --tail=15 2>/dev/null || docker compose logs --tail=15 2>/dev/null || echo "   Контейнеры не запущены"
echo ""

echo "6. Рекомендуемые команды для запуска:"
echo ""
if [ -f .env ]; then
  if [ -f ssl/fullchain.pem ] && [ -f ssl/privkey.pem ]; then
    echo "   У вас есть .env и SSL. Запуск с HTTPS:"
    echo "   docker-compose -f docker-compose.https.yml up -d --build"
  else
    echo "   Запуск без HTTPS (HTTP на порту 80):"
    echo "   docker-compose up -d --build"
  fi
else
  echo "   Сначала создайте .env в корне проекта!"
  echo "   Затем: docker-compose up -d --build"
fi
echo ""
echo "=========================================="
