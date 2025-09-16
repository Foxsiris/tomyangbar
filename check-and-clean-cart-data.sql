-- Проверка и очистка данных корзины
-- Выполните в Supabase SQL Editor

-- 1. Проверяем текущие данные в таблицах
SELECT '=== CARTS TABLE ===' as info;
SELECT * FROM carts ORDER BY created_at DESC LIMIT 10;

SELECT '=== CART_ITEMS TABLE ===' as info;
SELECT * FROM cart_items ORDER BY created_at DESC LIMIT 10;

-- 2. Проверяем количество записей
SELECT '=== TABLE COUNTS ===' as info;
SELECT 'carts' as table_name, COUNT(*) as count FROM carts
UNION ALL
SELECT 'cart_items' as table_name, COUNT(*) as count FROM cart_items;

-- 3. Проверяем RLS статус
SELECT '=== RLS STATUS ===' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('carts', 'cart_items');

-- 4. Проверяем политики
SELECT '=== POLICIES ===' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('carts', 'cart_items');

-- 5. ОЧИСТКА ДАННЫХ (раскомментируйте, если нужно очистить)
/*
-- Удаляем все элементы корзины
DELETE FROM cart_items;

-- Удаляем все корзины
DELETE FROM carts;

-- Проверяем, что таблицы пустые
SELECT 'carts' as table_name, COUNT(*) as count FROM carts
UNION ALL
SELECT 'cart_items' as table_name, COUNT(*) as count FROM cart_items;
*/
