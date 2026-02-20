-- Добавить колонку open_on_refresh в таблицу news
-- Если true — новость автоматически открывается при загрузке главной страницы
ALTER TABLE news ADD COLUMN IF NOT EXISTS open_on_refresh BOOLEAN DEFAULT false;
