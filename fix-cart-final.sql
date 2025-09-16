-- Окончательное исправление политик для корзин
-- Выполните в Supabase SQL Editor

-- Отключаем RLS для корзин и элементов корзин (временно)
ALTER TABLE carts DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;

-- Удаляем все политики
DROP POLICY IF EXISTS "Enable all operations for carts" ON carts;
DROP POLICY IF EXISTS "Enable all operations for cart_items" ON cart_items;
DROP POLICY IF EXISTS "Users can manage own carts" ON carts;
DROP POLICY IF EXISTS "Anonymous users can manage session carts" ON carts;
DROP POLICY IF EXISTS "Allow anonymous cart creation" ON carts;
DROP POLICY IF EXISTS "Allow anonymous cart selection" ON carts;
DROP POLICY IF EXISTS "Anonymous users can create session carts" ON carts;
DROP POLICY IF EXISTS "Anonymous users can select session carts" ON carts;
DROP POLICY IF EXISTS "Anonymous users can update session carts" ON carts;
DROP POLICY IF EXISTS "Anonymous users can delete session carts" ON carts;
DROP POLICY IF EXISTS "Users can manage own cart items" ON cart_items;
DROP POLICY IF EXISTS "Anonymous users can manage session cart items" ON cart_items;
DROP POLICY IF EXISTS "Allow anonymous cart items creation" ON cart_items;
DROP POLICY IF EXISTS "Allow anonymous cart items selection" ON cart_items;
DROP POLICY IF EXISTS "Anonymous users can create session cart items" ON cart_items;
DROP POLICY IF EXISTS "Anonymous users can select session cart items" ON cart_items;
DROP POLICY IF EXISTS "Anonymous users can update session cart items" ON cart_items;
DROP POLICY IF EXISTS "Anonymous users can delete session cart items" ON cart_items;
