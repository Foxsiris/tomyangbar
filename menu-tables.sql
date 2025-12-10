-- Таблицы для меню блюд
-- Выполните в Supabase SQL Editor если хотите перенести меню в БД

-- Таблица категорий
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица блюд
CREATE TABLE dishes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    weight VARCHAR(50),
    category_id VARCHAR(50) REFERENCES categories(id),
    image_url TEXT,
    is_popular BOOLEAN DEFAULT false,
    is_spicy BOOLEAN DEFAULT false,
    is_vegetarian BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    calories INTEGER,
    proteins DECIMAL(5,1),
    fats DECIMAL(5,1),
    carbs DECIMAL(5,1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_dishes_category ON dishes(category_id);
CREATE INDEX idx_dishes_active ON dishes(is_active);
CREATE INDEX idx_dishes_popular ON dishes(is_popular);

-- Триггеры для updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dishes_updated_at BEFORE UPDATE ON dishes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS политики
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

-- Политики для категорий (публичный доступ)
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (is_active = true);

-- Политики для блюд (публичный доступ)
CREATE POLICY "Dishes are viewable by everyone" ON dishes
    FOR SELECT USING (is_active = true);

-- Вставка категорий
INSERT INTO categories (id, name, description, sort_order) VALUES
    ('starters', 'Стартеры', 'Легкие закуски для начала трапезы', 1),
    ('sushi', 'Ошидзуси и Онигири', 'Традиционные японские суши', 2),
    ('rolls', 'Роллы', 'Современные роллы с различными начинками', 3),
    ('fried', 'Закуски фрай', 'Хрустящие жареные закуски', 4),
    ('hot', 'Горячие блюда', 'Основные горячие блюда', 5),
    ('dumplings', 'Гедза / Дим-самы / Баоцзы', 'Пельмени и паровые булочки', 6),
    ('bao', 'Бао', 'Нежные булочки с начинкой', 7),
    ('wok', 'ВОК', 'Блюда в стиле вок', 8),
    ('salads', 'Салаты', 'Свежие и легкие салаты', 9),
    ('soups', 'Супы', 'Традиционные азиатские супы', 10),
    ('desserts', 'Десерты', 'Сладкие завершения трапезы', 11),
    ('drinks', 'Напитки', 'Освежающие напитки', 12);

-- Вставка блюд (примеры)
INSERT INTO dishes (name, description, price, weight, category_id, image_url, is_popular, is_spicy, is_vegetarian) VALUES
    ('Бао с уткой', 'Булочка бао, утка, овощной соус, морковь, огурец, дайкон, ростки сои, кунжут кимчи и зеленый лук', 450.00, '220 г', 'starters', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', true, false, false),
    ('Утка по-азиатски 1/2', 'Традиционная утка с хрустящей корочкой и соусом', 2030.00, '350/90/500/8 шт/130 г', 'starters', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', true, false, false),
    ('Итальянский', 'Снежный краб, огурец, сливочный сыр, нори, рис, соевый соус', 580.00, '220 г', 'rolls', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, false, false),
    ('Бостон', 'Креветка, сливочный сыр, авокадо, огурец, картофель пай, рис, нори, соевый соус', 580.00, '270 г', 'rolls', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, false, false),
    ('Американский', 'Лосось, угорь, сливочный сыр, авокадо, тобико, огурец, соус кабаяки, нори, рис, сухари панко, соевый соус', 710.00, '310 г', 'rolls', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', true, false, false),
    ('Тайга', 'Тунец, снежный краб, сливочный сыр, японский омлет, рис, нори, спайси соус, соевый соус', 580.00, '250 г', 'rolls', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, true, false),
    ('Том Ям', 'Острый суп с креветками, грибами и кокосовым молоком', 450.00, '350 мл', 'soups', 'https://images.unsplash.com/photo-1563379091339-03246963d4a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', true, true, false),
    ('Суп Том Кха', 'Кокосовый суп с курицей и грибами', 380.00, '350 мл', 'soups', 'https://images.unsplash.com/photo-1563379091339-03246963d4a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, false, false),
    ('Мисо суп', 'Традиционный японский суп с тофу и водорослями', 180.00, '250 мл', 'soups', 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, false, true);
