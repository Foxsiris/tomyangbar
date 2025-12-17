# Интеграция с iiko

## Описание

Интеграция позволяет автоматически отправлять заказы в систему iiko, чтобы повара в ресторане видели их на кухонном экране.

## Настройка
    
### 1. Получите API-ключ iiko

1. Войдите в личный кабинет [iiko.biz](https://iiko.biz)
2. Перейдите в раздел **API** → **Интеграции**
3. Создайте новый API-ключ (apiLogin)
4. Скопируйте ключ

### 2. Получите ID организации

После настройки API-ключа, вы можете получить ID организации через API:

```bash
curl -X POST https://api-ru.iiko.services/api/1/access_token \
  -H "Content-Type: application/json" \
  -d '{"apiLogin": "ВАШ_API_КЛЮЧ"}'
```

Затем с полученным токеном:

```bash
curl -X POST https://api-ru.iiko.services/api/1/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ПОЛУЧЕННЫЙ_ТОКЕН" \
  -d '{}'
```

### 3. Добавьте переменные окружения

Добавьте в файл `backend/.env`:

```env
# iiko Integration
IIKO_API_LOGIN=ваш_api_login_из_iiko_biz
IIKO_ORGANIZATION_ID=id_вашей_организации
IIKO_TERMINAL_GROUP_ID=id_терминальной_группы_опционально
```

### 4. Перезапустите бэкенд

```bash
cd backend
npm run dev
```

## Как это работает

1. Клиент оформляет заказ на сайте
2. Заказ сохраняется в Supabase (как раньше)
3. **Новое:** Заказ автоматически отправляется в iiko
4. Повар видит заказ на кухонном экране iiko
5. При ошибке отправки в iiko — заказ всё равно создаётся в нашей системе (iiko не блокирует)

## Маппинг данных

| Наше поле | Поле iiko |
|-----------|-----------|
| `customer_name` | `customer.name` |
| `phone` | `phone` (форматируется в +7XXXXXXXXXX) |
| `delivery_type: 'delivery'` | `orderServiceType: 'DeliveryByClient'` |
| `delivery_type: 'pickup'` | `orderServiceType: 'DeliveryPickUp'` |
| `payment_method: 'cash'` | `payments[0].paymentTypeKind: 'Cash'` |
| `payment_method: 'card/sbp'` | `payments[0].paymentTypeKind: 'Card'` |

## Маппинг продуктов

**Важно:** Для корректной работы нужно связать ID блюд в вашей базе с ID продуктов в iiko.

### Вариант 1: Добавить поле iiko_product_id в таблицу dishes

```sql
ALTER TABLE dishes ADD COLUMN iiko_product_id VARCHAR(255);
```

Затем заполните это поле для каждого блюда соответствующим ID из iiko.

### Вариант 2: Синхронизация меню из iiko

Можно загружать меню напрямую из iiko и синхронизировать с вашей базой.

## Тестирование

Для проверки работы iiko добавлен endpoint:

```bash
GET /api/iiko/health
```

## Возможные ошибки

| Ошибка | Причина | Решение |
|--------|---------|---------|
| `IIKO_API_LOGIN не настроен` | Не указан API-ключ | Добавьте IIKO_API_LOGIN в .env |
| `Unauthorized` | Неверный API-ключ | Проверьте ключ в iiko.biz |
| `Organization not found` | Неверный ID организации | Получите ID через API |
| `Product not found` | Блюдо не найдено в iiko | Настройте маппинг продуктов |

## API Reference

- [iiko Transport API](https://api-ru.iiko.services/)
- [Документация](https://api-ru.iiko.services/#tag/Deliveries)

