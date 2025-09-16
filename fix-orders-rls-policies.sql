-- Исправление RLS политик для таблицы orders
-- Выполните эти команды в SQL Editor в Supabase Dashboard

-- Удаляем существующие политики для orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

-- Создаем новые политики для orders
-- Политика для просмотра заказов (авторизованные пользователи видят свои заказы)
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

-- Политика для создания заказов (разрешаем создавать заказы всем, включая анонимных пользователей)
CREATE POLICY "Anyone can create orders" ON orders
    FOR INSERT WITH CHECK (true);

-- Политика для обновления заказов (только авторизованные пользователи могут обновлять свои заказы)
CREATE POLICY "Users can update own orders" ON orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Политика для удаления заказов (только авторизованные пользователи могут удалять свои заказы)
CREATE POLICY "Users can delete own orders" ON orders
    FOR DELETE USING (auth.uid() = user_id);

-- Удаляем существующие политики для order_items
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;

-- Создаем новые политики для order_items
-- Политика для просмотра элементов заказов
CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
        )
    );

-- Политика для создания элементов заказов (разрешаем всем)
CREATE POLICY "Anyone can create order items" ON order_items
    FOR INSERT WITH CHECK (true);

-- Политика для обновления элементов заказов
CREATE POLICY "Users can update own order items" ON order_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Политика для удаления элементов заказов
CREATE POLICY "Users can delete own order items" ON order_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Дополнительная политика для админов (если нужно)
-- Создаем роль admin (если её нет)
-- DO $$ 
-- BEGIN
--     IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
--         CREATE ROLE admin;
--     END IF;
-- END $$;

-- Политика для админов (могут видеть все заказы)
-- CREATE POLICY "Admins can view all orders" ON orders
--     FOR SELECT USING (
--         EXISTS (
--             SELECT 1 FROM auth.users 
--             WHERE auth.users.id = auth.uid() 
--             AND auth.users.raw_user_meta_data->>'role' = 'admin'
--         )
--     );

-- Политика для админов (могут обновлять все заказы)
-- CREATE POLICY "Admins can update all orders" ON orders
--     FOR UPDATE USING (
--         EXISTS (
--             SELECT 1 FROM auth.users 
--             WHERE auth.users.id = auth.uid() 
--             AND auth.users.raw_user_meta_data->>'role' = 'admin'
--         )
--     );
