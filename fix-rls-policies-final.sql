-- Исправление RLS политик для корзин - ФИНАЛЬНАЯ ВЕРСИЯ
-- Выполните в Supabase SQL Editor

-- ВАРИАНТ 1: Отключаем RLS для корзин (рекомендуется для тестирования)
ALTER TABLE carts DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;

-- ВАРИАНТ 2: Если хотите оставить RLS включенным, используйте эти политики:
-- (раскомментируйте, если нужен RLS)

/*
-- Включаем RLS
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Удаляем все существующие политики
DROP POLICY IF EXISTS "Users can manage own carts" ON carts;
DROP POLICY IF EXISTS "Anonymous users can manage session carts" ON carts;
DROP POLICY IF EXISTS "Allow anonymous cart creation" ON carts;
DROP POLICY IF EXISTS "Allow anonymous cart selection" ON carts;
DROP POLICY IF EXISTS "Anonymous users can create session carts" ON carts;
DROP POLICY IF EXISTS "Anonymous users can select session carts" ON carts;
DROP POLICY IF EXISTS "Anonymous users can update session carts" ON carts;
DROP POLICY IF EXISTS "Anonymous users can delete session carts" ON carts;
DROP POLICY IF EXISTS "Enable all operations for carts" ON carts;

DROP POLICY IF EXISTS "Users can manage own cart items" ON cart_items;
DROP POLICY IF EXISTS "Anonymous users can manage session cart items" ON cart_items;
DROP POLICY IF EXISTS "Allow anonymous cart items creation" ON cart_items;
DROP POLICY IF EXISTS "Allow anonymous cart items selection" ON cart_items;
DROP POLICY IF EXISTS "Anonymous users can create session cart items" ON cart_items;
DROP POLICY IF EXISTS "Anonymous users can select session cart items" ON cart_items;
DROP POLICY IF EXISTS "Anonymous users can update session cart items" ON cart_items;
DROP POLICY IF EXISTS "Anonymous users can delete session cart items" ON cart_items;
DROP POLICY IF EXISTS "Enable all operations for cart_items" ON cart_items;

-- Создаем новые политики для корзин
CREATE POLICY "Allow all operations on carts" ON carts
    FOR ALL USING (true);

-- Создаем новые политики для элементов корзин
CREATE POLICY "Allow all operations on cart_items" ON cart_items
    FOR ALL USING (true);
*/

-- Проверяем статус RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('carts', 'cart_items');

-- Проверяем политики (если RLS включен)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('carts', 'cart_items');
