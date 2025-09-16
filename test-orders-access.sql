-- Тест доступа к заказам
-- Выполните эти команды в Supabase SQL Editor

-- 1. Проверяем, сколько заказов в базе
SELECT 'Всего заказов в базе:' as info;
SELECT COUNT(*) as total_orders FROM orders;

-- 2. Проверяем заказы с деталями
SELECT 'Заказы с деталями:' as info;
SELECT 
  id, 
  order_number,
  customer_name, 
  status, 
  final_total,
  created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Проверяем RLS статус
SELECT 'Статус RLS для orders:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'orders';

-- 4. Проверяем политики RLS
SELECT 'Политики RLS для orders:' as info;
SELECT policyname, cmd, with_check 
FROM pg_policies 
WHERE tablename = 'orders';

-- 5. Проверяем, есть ли order_items
SELECT 'Элементы заказов:' as info;
SELECT 
  oi.id,
  oi.order_id,
  oi.dish_name,
  oi.quantity,
  oi.price,
  o.customer_name
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
ORDER BY oi.created_at DESC
LIMIT 5;
