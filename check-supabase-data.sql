-- Проверка данных в Supabase
-- Выполните эти запросы в SQL Editor

-- 1. Проверяем таблицы
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('categories', 'dishes', 'users', 'orders', 'carts', 'cart_items');

-- 2. Проверяем количество категорий
SELECT COUNT(*) as categories_count FROM categories;

-- 3. Проверяем количество блюд
SELECT COUNT(*) as dishes_count FROM dishes;

-- 4. Показываем первые 5 категорий
SELECT * FROM categories LIMIT 5;

-- 5. Показываем первые 5 блюд
SELECT * FROM dishes LIMIT 5;

-- 6. Проверяем RLS политики
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('categories', 'dishes');
