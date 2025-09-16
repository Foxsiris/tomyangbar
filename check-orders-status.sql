-- Проверка текущего состояния заказов
-- Выполните эти команды в Supabase SQL Editor

-- 1. Проверяем, есть ли поле order_number в таблице orders
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'order_number';

-- 2. Проверяем существующие заказы
SELECT 'Текущие заказы:' as info;
SELECT id, order_number, customer_name, status, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Проверяем, есть ли последовательность
SELECT 'Последовательность order_number_seq:' as info;
SELECT EXISTS (
  SELECT 1 FROM pg_sequences 
  WHERE sequencename = 'order_number_seq'
) as sequence_exists;

-- 4. Если последовательность есть, проверяем её значение
SELECT 'Текущее значение последовательности:' as info;
SELECT last_value FROM order_number_seq;
