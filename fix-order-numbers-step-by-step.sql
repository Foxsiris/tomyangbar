-- Пошаговое исправление номеров заказов
-- Выполните команды по порядку в Supabase SQL Editor

-- ШАГ 1: Проверяем текущее состояние
SELECT 'ШАГ 1: Проверяем текущее состояние' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'order_number';

-- ШАГ 2: Добавляем поле order_number (если его нет)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number INTEGER;

-- ШАГ 3: Создаем последовательность (если её нет)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- ШАГ 4: Обновляем существующие заказы
-- Сначала посмотрим, сколько заказов без номера
SELECT 'Заказы без номера:' as info;
SELECT COUNT(*) as count FROM orders WHERE order_number IS NULL;

-- Обновляем заказы по одному
UPDATE orders 
SET order_number = 1 
WHERE id = (SELECT id FROM orders WHERE order_number IS NULL ORDER BY created_at ASC LIMIT 1);

UPDATE orders 
SET order_number = 2 
WHERE id = (SELECT id FROM orders WHERE order_number IS NULL ORDER BY created_at ASC LIMIT 1);

UPDATE orders 
SET order_number = 3 
WHERE id = (SELECT id FROM orders WHERE order_number IS NULL ORDER BY created_at ASC LIMIT 1);

UPDATE orders 
SET order_number = 4 
WHERE id = (SELECT id FROM orders WHERE order_number IS NULL ORDER BY created_at ASC LIMIT 1);

UPDATE orders 
SET order_number = 5 
WHERE id = (SELECT id FROM orders WHERE order_number IS NULL ORDER BY created_at ASC LIMIT 1);

-- ШАГ 5: Устанавливаем значение последовательности
SELECT setval('order_number_seq', COALESCE((SELECT MAX(order_number) FROM orders), 0) + 1);

-- ШАГ 6: Создаем функцию и триггер
CREATE OR REPLACE FUNCTION assign_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := nextval('order_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assign_order_number ON orders;
CREATE TRIGGER trigger_assign_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION assign_order_number();

-- ШАГ 7: Проверяем результат
SELECT 'Результат:' as info;
SELECT id, order_number, customer_name, status, created_at 
FROM orders 
ORDER BY order_number ASC;
