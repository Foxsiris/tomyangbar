-- Исправление дубликатов номеров заказов
-- Выполните эти команды в Supabase SQL Editor

-- 1. Сначала очищаем все номера заказов
UPDATE orders SET order_number = NULL;

-- 2. Присваиваем номера заново в правильном порядке
WITH ordered_orders AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as new_order_number
  FROM orders
)
UPDATE orders 
SET order_number = ordered_orders.new_order_number
FROM ordered_orders
WHERE orders.id = ordered_orders.id;

-- 3. Устанавливаем значение последовательности на максимальный номер + 1
SELECT setval('order_number_seq', COALESCE((SELECT MAX(order_number) FROM orders), 0) + 1);

-- 4. Проверяем результат
SELECT 'Исправленные номера заказов:' as info;
SELECT id, order_number, customer_name, status, created_at 
FROM orders 
ORDER BY order_number ASC;
