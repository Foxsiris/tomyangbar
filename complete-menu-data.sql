-- Полное меню для Tom Yang Bar
-- Выполните этот скрипт в Supabase SQL Editor

-- Вставка всех блюд из menuData.js
INSERT INTO dishes (name, description, price, weight, category_id, image_url, is_popular, is_spicy, is_vegetarian, sort_order) VALUES
-- Стартеры
('Бао с уткой', 'Булочка бао, утка, овощной соус, морковь, огурец, дайкон, ростки сои, кунжут кимчи и зеленый лук', 450.00, '220 г', 'starters', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', true, false, false, 1),
('Утка по-азиатски 1/2', 'Традиционная утка с хрустящей корочкой и соусом', 2030.00, '350/90/500/8 шт/130 г', 'starters', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', true, false, false, 2),
('Васаби', 'Острый японский хрен', 30.00, '5 г', 'starters', 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, true, true, 3),
('Имбирь', 'Маринованный имбирь', 40.00, '15 г', 'starters', 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, false, true, 4),

-- Роллы
('Итальянский', 'Снежный краб, огурец, сливочный сыр, нори, рис, соевый соус', 580.00, '220 г', 'rolls', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, false, false, 1),
('Бостон', 'Креветка, сливочный сыр, авокадо, огурец, картофель пай, рис, нори, соевый соус', 580.00, '270 г', 'rolls', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, false, false, 2),
('Американский', 'Лосось, угорь, сливочный сыр, авокадо, тобико, огурец, соус кабаяки, нори, рис, сухари панко, соевый соус', 710.00, '310 г', 'rolls', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', true, false, false, 3),
('Тайга', 'Тунец, снежный краб, сливочный сыр, японский омлет, рис, нори, спайси соус, соевый соус', 580.00, '250 г', 'rolls', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, true, false, 4),
('Ролл Филадельфия', 'Лосось, сливочный сыр, огурец, рис, нори', 420.00, '240 г', 'rolls', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', true, false, false, 5),
('Ролл Калифорния', 'Краб, авокадо, огурец, рис, нори', 350.00, '220 г', 'rolls', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, false, false, 6),

-- Дим-самы
('Дим-самы с угрем и грибами', 'Прозрачное тесто из тапиоки, грибы, угорь, лук-порей', 410.00, '90 г', 'dumplings', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, false, false, 1),

-- Бао
('Бао', 'Нежные булочки бао из пшеничного теста', 70.00, '70 г', 'bao', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, false, true, 1),

-- Десерты
('Утенок Манго', 'Мусс манго, кусочки свежего манго, белый шоколад', 410.00, '90 г', 'desserts', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', true, false, true, 1),
('Банановый нама', 'Молочный шоколад, какао, банан', 330.00, '80 г', 'desserts', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, false, true, 2),

-- Напитки
('Лимонад "Клубника/Бузина"', 'Освежающий лимонад с натуральными ягодами', 380.00, '330 мл', 'drinks', 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, false, true, 1),
('Зеленый чай', 'Традиционный японский зеленый чай', 120.00, '250 мл', 'drinks', 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, false, true, 2),
('Мохито', 'Освежающий коктейль с мятой и лаймом', 450.00, '300 мл', 'drinks', 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, false, true, 3),

-- Супы
('Том Ям', 'Острый суп с креветками, грибами и кокосовым молоком', 450.00, '350 мл', 'soups', 'https://images.unsplash.com/photo-1563379091339-03246963d4a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', true, true, false, 1),
('Суп Том Кха', 'Кокосовый суп с курицей и грибами', 380.00, '350 мл', 'soups', 'https://images.unsplash.com/photo-1563379091339-03246963d4a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, false, false, 2),
('Мисо суп', 'Традиционный японский суп с тофу и водорослями', 180.00, '250 мл', 'soups', 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, false, true, 3),

-- Горячие блюда
('Пад Тай', 'Жареная рисовая лапша с курицей, яйцом и овощами', 380.00, '300 г', 'hot', 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', true, false, false, 1),
('Курица в кисло-сладком соусе', 'Курица в традиционном кисло-сладком соусе с овощами', 420.00, '280 г', 'hot', 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, false, false, 2),

-- Салаты
('Салат Цезарь', 'Классический салат с курицей, сыром и соусом', 280.00, '200 г', 'salads', 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, false, false, 1),
('Салат с авокадо', 'Свежий салат с авокадо, томатами и зеленью', 320.00, '180 г', 'salads', 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, false, true, 2),

-- Вок блюда
('Вок с говядиной', 'Жареная лапша с говядиной и овощами в воке', 450.00, '320 г', 'wok', 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', true, false, false, 1),
('Вок с морепродуктами', 'Лапша с креветками, кальмарами и овощами', 520.00, '300 г', 'wok', 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, false, false, 2),

-- Закуски фрай
('Креветки в кляре', 'Хрустящие креветки в пивном кляре', 380.00, '150 г', 'fried', 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, false, false, 1),
('Спринг роллы', 'Хрустящие роллы с овощами и курицей', 280.00, '120 г', 'fried', 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', false, false, false, 2);
