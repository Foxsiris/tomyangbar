-- Проверка заказов и исправление доступа для админов
-- Выполните эти команды в Supabase SQL Editor

-- 1. Проверяем, какие заказы есть в базе
SELECT 'Все заказы в базе:' as info;
SELECT id, customer_name, phone, status, created_at, user_id FROM orders ORDER BY created_at DESC;

-- 2. Проверяем текущие политики
SELECT 'Текущие политики для orders:' as info;
SELECT policyname, cmd, with_check FROM pg_policies WHERE tablename = 'orders';

-- 3. Добавляем политику для админов (могут видеть все заказы)
-- Сначала создаем функцию для проверки роли админа
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Проверяем, есть ли пользователь в таблице users с ролью admin
  -- Или используем email для определения админа
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (
      auth.users.email = 'admin@tomyangbar.ru' 
      OR auth.users.email = 'daniilcyplakov@gmail.com'
      OR auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Добавляем политики для админов
CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (is_admin() OR auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can update all orders" ON orders
    FOR UPDATE USING (is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admins can delete all orders" ON orders
    FOR DELETE USING (is_admin() OR auth.uid() = user_id);

-- 5. Аналогично для order_items
CREATE POLICY "Admins can view all order items" ON order_items
    FOR SELECT USING (
        is_admin() OR
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
        )
    );

CREATE POLICY "Admins can update all order items" ON order_items
    FOR UPDATE USING (
        is_admin() OR
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can delete all order items" ON order_items
    FOR DELETE USING (
        is_admin() OR
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- 6. Проверяем результат
SELECT 'Обновленные политики:' as info;
SELECT policyname, cmd, with_check FROM pg_policies WHERE tablename = 'orders';
