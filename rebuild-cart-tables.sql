-- Полное пересоздание таблиц корзины
-- ВНИМАНИЕ: Это удалит ВСЕ данные корзин!
-- Выполните в Supabase SQL Editor

-- 1. Удаляем все данные
DELETE FROM cart_items;
DELETE FROM carts;

-- 2. Удаляем таблицы (если нужно)
-- DROP TABLE IF EXISTS cart_items CASCADE;
-- DROP TABLE IF EXISTS carts CASCADE;

-- 3. Пересоздаем таблицы (если удалили выше)
/*
-- Таблица корзин
CREATE TABLE carts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица элементов корзины
CREATE TABLE cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    dish_id INTEGER NOT NULL,
    dish_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

-- 4. Отключаем RLS
ALTER TABLE carts DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;

-- 5. Удаляем все политики (если есть)
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

-- 6. Проверяем результат
SELECT '=== FINAL STATUS ===' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('carts', 'cart_items');

SELECT 'carts' as table_name, COUNT(*) as count FROM carts
UNION ALL
SELECT 'cart_items' as table_name, COUNT(*) as count FROM cart_items;
