-- Быстрое исправление для админ-панели
-- Выполните эти команды в Supabase SQL Editor

-- 1. Проверяем заказы
SELECT 'Заказы в базе:' as info;
SELECT id, customer_name, phone, status, created_at FROM orders ORDER BY created_at DESC;

-- 2. ВРЕМЕННО отключаем RLS для тестирования
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- 3. Проверяем статус
SELECT 'Статус RLS:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('orders', 'order_items');

-- 4. Проверяем, что заказы теперь доступны
SELECT 'Проверка доступа:' as info;
SELECT COUNT(*) as total_orders FROM orders;
SELECT COUNT(*) as total_order_items FROM order_items;

-- ⚠️ ВАЖНО: После тестирования включите RLS обратно:
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
