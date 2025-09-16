-- ВРЕМЕННОЕ отключение RLS для тестирования
-- ⚠️ ВНИМАНИЕ: Это только для тестирования! В продакшене включите RLS обратно!

-- Отключаем RLS для orders и order_items
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- Проверяем статус
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('orders', 'order_items');

-- После тестирования включите RLS обратно:
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
