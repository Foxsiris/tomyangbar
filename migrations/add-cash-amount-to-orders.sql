-- Добавление полей для расчёта сдачи при оплате наличными
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cash_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS change_amount NUMERIC(10,2) DEFAULT 0;

-- Комментарии к полям
COMMENT ON COLUMN orders.cash_amount IS 'Сумма, которую даёт клиент при оплате наличными';
COMMENT ON COLUMN orders.change_amount IS 'Сумма сдачи, которую нужно подготовить';
