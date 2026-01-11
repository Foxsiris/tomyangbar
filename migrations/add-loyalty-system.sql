-- Миграция для системы лояльности Tom Yang Bar
-- Выполните этот скрипт в SQL Editor в Supabase Dashboard

-- Добавляем поля для системы лояльности в таблицу users
ALTER TABLE users ADD COLUMN IF NOT EXISTS bonus_balance INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_spent DECIMAL(12,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_level VARCHAR(20) DEFAULT 'bronze' CHECK (loyalty_level IN ('bronze', 'silver', 'gold'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS registration_bonus_given BOOLEAN DEFAULT FALSE;

-- Добавляем поля для бонусов в таблицу orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS bonuses_used INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS bonuses_earned INTEGER DEFAULT 0;

-- Создаем таблицу для истории транзакций бонусов
CREATE TABLE IF NOT EXISTS bonus_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL, -- положительное = начисление, отрицательное = списание
    type VARCHAR(50) NOT NULL CHECK (type IN ('registration', 'order_cashback', 'order_payment', 'admin_adjustment', 'expiration')),
    description TEXT,
    balance_after INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_bonus_transactions_user_id ON bonus_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bonus_transactions_order_id ON bonus_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_bonus_transactions_created_at ON bonus_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_users_loyalty_level ON users(loyalty_level);
CREATE INDEX IF NOT EXISTS idx_users_total_spent ON users(total_spent);

-- RLS политики для bonus_transactions
ALTER TABLE bonus_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bonus transactions" ON bonus_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Функция для автоматического расчета уровня лояльности
CREATE OR REPLACE FUNCTION calculate_loyalty_level(spent DECIMAL)
RETURNS VARCHAR(20) AS $$
BEGIN
    IF spent >= 100000 THEN
        RETURN 'gold';
    ELSIF spent >= 80000 THEN
        RETURN 'silver';
    ELSE
        RETURN 'bronze';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения процента кэшбэка по уровню
CREATE OR REPLACE FUNCTION get_cashback_percent(level VARCHAR(20))
RETURNS INTEGER AS $$
BEGIN
    CASE level
        WHEN 'gold' THEN RETURN 5;
        WHEN 'silver' THEN RETURN 3;
        ELSE RETURN 2; -- bronze
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления уровня лояльности
CREATE OR REPLACE FUNCTION update_loyalty_level()
RETURNS TRIGGER AS $$
BEGIN
    NEW.loyalty_level = calculate_loyalty_level(NEW.total_spent);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_loyalty_level ON users;
CREATE TRIGGER trigger_update_loyalty_level
    BEFORE UPDATE OF total_spent ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_loyalty_level();

-- Комментарии к полям
COMMENT ON COLUMN users.bonus_balance IS 'Текущий баланс бонусов пользователя (1 бонус = 1 рубль)';
COMMENT ON COLUMN users.total_spent IS 'Общая сумма покупок для определения уровня лояльности';
COMMENT ON COLUMN users.loyalty_level IS 'Уровень лояльности: bronze (2%), silver (3%), gold (5%)';
COMMENT ON COLUMN users.registration_bonus_given IS 'Флаг получения приветственных 200 бонусов';
COMMENT ON COLUMN orders.bonuses_used IS 'Количество бонусов, использованных для оплаты заказа';
COMMENT ON COLUMN orders.bonuses_earned IS 'Количество бонусов, начисленных за заказ';
