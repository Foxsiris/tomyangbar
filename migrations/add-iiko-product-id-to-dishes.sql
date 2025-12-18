-- Миграция: добавление поля iiko_product_id для интеграции с iiko
-- Выполните в Supabase SQL Editor

-- Добавляем поле iiko_product_id в таблицу dishes
ALTER TABLE dishes 
ADD COLUMN IF NOT EXISTS iiko_product_id UUID DEFAULT NULL;

-- Добавляем комментарий к полю для документации
COMMENT ON COLUMN dishes.iiko_product_id IS 'UUID продукта в системе iiko (из номенклатуры iiko)';

-- Создаём индекс для быстрого поиска по iiko_product_id
CREATE INDEX IF NOT EXISTS idx_dishes_iiko_product_id ON dishes(iiko_product_id);

-- Примечание: После выполнения миграции, нужно заполнить поле iiko_product_id 
-- для каждого блюда соответствующим UUID из номенклатуры iiko.
-- Можно получить номенклатуру через API: GET /api/iiko/menu

