-- Создание админ-пользователя
-- Выполните эти команды в Supabase SQL Editor

-- 1. Создаем таблицу для админов (если её нет)
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Включаем RLS для таблицы admins
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 3. Создаем политику для админов
CREATE POLICY "Admins can view all admins" ON admins
    FOR SELECT USING (true);

-- 4. Создаем админ-пользователя (пароль: admin123)
INSERT INTO admins (email, name, password_hash, role) 
VALUES (
  'admin@tomyangbar.ru', 
  'Администратор', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- 5. Создаем функцию для проверки админа
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Проверяем, есть ли пользователь в таблице admins
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE email = 'admin@tomyangbar.ru' 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Обновляем политики для orders
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (is_admin() OR auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
CREATE POLICY "Admins can update all orders" ON orders
    FOR UPDATE USING (is_admin() OR auth.uid() = user_id);

-- 7. Обновляем политики для order_items
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
CREATE POLICY "Admins can view all order items" ON order_items
    FOR SELECT USING (
        is_admin() OR
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
        )
    );

-- 8. Проверяем результат
SELECT 'Админ создан:' as info;
SELECT email, name, role, is_active FROM admins WHERE email = 'admin@tomyangbar.ru';
