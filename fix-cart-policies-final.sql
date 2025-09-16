-- Исправление политик для корзин - ФИНАЛЬНАЯ ВЕРСИЯ
-- Выполните в Supabase SQL Editor

-- Удаляем ВСЕ существующие политики для корзин
DROP POLICY IF EXISTS "Users can manage own carts" ON carts;
DROP POLICY IF EXISTS "Anonymous users can manage session carts" ON carts;
DROP POLICY IF EXISTS "Allow anonymous cart creation" ON carts;
DROP POLICY IF EXISTS "Allow anonymous cart selection" ON carts;
DROP POLICY IF EXISTS "Anonymous users can create session carts" ON carts;
DROP POLICY IF EXISTS "Anonymous users can select session carts" ON carts;
DROP POLICY IF EXISTS "Anonymous users can update session carts" ON carts;
DROP POLICY IF EXISTS "Anonymous users can delete session carts" ON carts;
DROP POLICY IF EXISTS "Enable all operations for carts" ON carts;

-- Удаляем ВСЕ существующие политики для элементов корзин
DROP POLICY IF EXISTS "Users can manage own cart items" ON cart_items;
DROP POLICY IF EXISTS "Anonymous users can manage session cart items" ON cart_items;
DROP POLICY IF EXISTS "Allow anonymous cart items creation" ON cart_items;
DROP POLICY IF EXISTS "Allow anonymous cart items selection" ON cart_items;
DROP POLICY IF EXISTS "Anonymous users can create session cart items" ON cart_items;
DROP POLICY IF EXISTS "Anonymous users can select session cart items" ON cart_items;
DROP POLICY IF EXISTS "Anonymous users can update session cart items" ON cart_items;
DROP POLICY IF EXISTS "Anonymous users can delete session cart items" ON cart_items;
DROP POLICY IF EXISTS "Enable all operations for cart_items" ON cart_items;

-- Создаем новые упрощенные политики для корзин
CREATE POLICY "Enable all operations for carts" ON carts
    FOR ALL USING (true);

-- Создаем новые упрощенные политики для элементов корзин
CREATE POLICY "Enable all operations for cart_items" ON cart_items
    FOR ALL USING (true);

-- Проверяем, что политики созданы
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('carts', 'cart_items');
