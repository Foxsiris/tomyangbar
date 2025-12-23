-- Добавление колонки image_url в таблицу categories
-- Выполните этот SQL в Supabase SQL Editor

ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Добавляем комментарий к колонке
COMMENT ON COLUMN categories.image_url IS 'URL изображения категории для отображения в меню';

