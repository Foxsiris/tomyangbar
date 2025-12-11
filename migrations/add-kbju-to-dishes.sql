-- Миграция: Добавление полей КБЖУ в таблицу dishes
-- Выполните в Supabase SQL Editor

-- Добавляем колонки КБЖУ, если их еще нет
DO $$ 
BEGIN
    -- Калории
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dishes' AND column_name = 'calories'
    ) THEN
        ALTER TABLE dishes ADD COLUMN calories INTEGER;
    END IF;
    
    -- Белки
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dishes' AND column_name = 'proteins'
    ) THEN
        ALTER TABLE dishes ADD COLUMN proteins DECIMAL(5,1);
    END IF;
    
    -- Жиры
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dishes' AND column_name = 'fats'
    ) THEN
        ALTER TABLE dishes ADD COLUMN fats DECIMAL(5,1);
    END IF;
    
    -- Углеводы
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dishes' AND column_name = 'carbs'
    ) THEN
        ALTER TABLE dishes ADD COLUMN carbs DECIMAL(5,1);
    END IF;
END $$;


