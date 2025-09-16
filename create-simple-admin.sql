-- Простое создание админа
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

-- 2. Создаем админ-пользователя
INSERT INTO admins (email, name, password_hash, role) 
VALUES (
  'admin@tomyangbar.ru', 
  'Администратор', 
  'admin123', -- простой пароль для тестирования
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- 3. Проверяем, что админ создан
SELECT 'Админ создан:' as info;
SELECT email, name, role, is_active FROM admins WHERE email = 'admin@tomyangbar.ru';

-- 4. ВРЕМЕННО отключаем RLS для тестирования
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- 5. Проверяем статус RLS
SELECT 'Статус RLS:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('orders', 'order_items');
