-- Миграция: добавление поля is_carbonated для напитков
-- Выполните в Supabase SQL Editor

-- Добавляем поле is_carbonated в таблицу dishes
ALTER TABLE dishes 
ADD COLUMN IF NOT EXISTS is_carbonated BOOLEAN DEFAULT NULL;

-- Добавляем комментарий к полю для документации
COMMENT ON COLUMN dishes.is_carbonated IS 'Для напитков: true - газированный, false - негазированный, NULL - не напиток';
