-- Добавление 'card_on_delivery' в допустимые способы оплаты
-- Выполните в Supabase SQL Editor: Dashboard → SQL Editor → New query

-- Удаляем старый CHECK (имя может отличаться — проверьте в Table Editor)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;

-- Добавляем новый CHECK с card_on_delivery
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check 
  CHECK (payment_method IN ('cash', 'card', 'card_on_delivery', 'sbp'));
