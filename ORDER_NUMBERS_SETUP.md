# Настройка порядковых номеров заказов

## Что нужно сделать

Для реализации порядковых номеров заказов (1, 2, 3...) вместо UUID выполните следующие шаги:

### 1. Выполните SQL команды в Supabase

Откройте Supabase Dashboard → SQL Editor и выполните команды из файла `add-order-number-field.sql`:

```sql
-- Добавляем поле order_number в таблицу orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number INTEGER;

-- Создаем последовательность для автоматической генерации номеров
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Обновляем существующие заказы порядковыми номерами
UPDATE orders 
SET order_number = nextval('order_number_seq')
WHERE order_number IS NULL
ORDER BY created_at ASC;

-- Устанавливаем значение последовательности на максимальный номер + 1
SELECT setval('order_number_seq', COALESCE((SELECT MAX(order_number) FROM orders), 0) + 1);

-- Создаем функцию для автоматического присвоения номера заказа
CREATE OR REPLACE FUNCTION assign_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := nextval('order_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для автоматического присвоения номера
DROP TRIGGER IF EXISTS trigger_assign_order_number ON orders;
CREATE TRIGGER trigger_assign_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION assign_order_number();
```

### 2. Проверьте результат

После выполнения SQL команд проверьте:

```sql
-- Проверяем заказы с номерами
SELECT id, order_number, customer_name, status, created_at 
FROM orders 
ORDER BY order_number ASC;

-- Проверяем текущее значение последовательности
SELECT last_value FROM order_number_seq;
```

### 3. Что изменилось

- **Новые заказы** будут автоматически получать порядковые номера: 1, 2, 3, 4...
- **Существующие заказы** получат номера в порядке их создания
- **Отображение** в админ-панели изменится с UUID на простые числа
- **Fallback** для старых заказов без номера (если что-то пойдет не так)

### 4. Результат

Теперь в админ-панели вы увидите:
- Вместо `#B92B3F` → `#1`, `#2`, `#3`...
- Красивые порядковые номера заказов
- Автоматическое присвоение номеров новым заказам

## Важно

- Все изменения в коде уже внесены
- Нужно только выполнить SQL команды в Supabase
- После этого новые заказы будут получать порядковые номера автоматически
