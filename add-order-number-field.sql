-- Добавление поля order_number для порядковых номеров заказов
-- Выполните эти команды в Supabase SQL Editor

-- 1. Добавляем поле order_number в таблицу orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number INTEGER;

-- 2. Создаем последовательность для автоматической генерации номеров
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- 3. Обновляем существующие заказы порядковыми номерами
-- (если у вас уже есть заказы в базе)
-- Сначала получаем заказы в правильном порядке и обновляем их
WITH ordered_orders AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
  FROM orders 
  WHERE order_number IS NULL
)
UPDATE orders 
SET order_number = ordered_orders.rn
FROM ordered_orders
WHERE orders.id = ordered_orders.id;

-- 4. Устанавливаем значение последовательности на максимальный номер + 1
SELECT setval('order_number_seq', COALESCE((SELECT MAX(order_number) FROM orders), 0) + 1);

-- 5. Создаем функцию для автоматического присвоения номера заказа
CREATE OR REPLACE FUNCTION assign_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := nextval('order_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Создаем триггер для автоматического присвоения номера
DROP TRIGGER IF EXISTS trigger_assign_order_number ON orders;
CREATE TRIGGER trigger_assign_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION assign_order_number();

-- 7. Проверяем результат
SELECT 'Проверка заказов с номерами:' as info;
SELECT id, order_number, customer_name, status, created_at 
FROM orders 
ORDER BY order_number ASC;

-- 8. Проверяем текущее значение последовательности
SELECT 'Текущее значение последовательности:' as info;
SELECT last_value FROM order_number_seq;
