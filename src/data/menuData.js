export const menuData = {
  categories: [
    {
      id: 'starters',
      name: 'Стартеры',
      description: 'Легкие закуски для начала трапезы'
    },
    {
      id: 'sushi',
      name: 'Ошидзуси и Онигири',
      description: 'Традиционные японские суши'
    },
    {
      id: 'rolls',
      name: 'Роллы',
      description: 'Современные роллы с различными начинками'
    },
    {
      id: 'fried',
      name: 'Закуски фрай',
      description: 'Хрустящие жареные закуски'
    },
    {
      id: 'hot',
      name: 'Горячие блюда',
      description: 'Основные горячие блюда'
    },
    {
      id: 'dumplings',
      name: 'Гедза / Дим-самы / Баоцзы',
      description: 'Пельмени и паровые булочки'
    },
    {
      id: 'bao',
      name: 'Бао',
      description: 'Нежные булочки с начинкой'
    },
    {
      id: 'wok',
      name: 'ВОК',
      description: 'Блюда в стиле вок'
    },
    {
      id: 'salads',
      name: 'Салаты',
      description: 'Свежие и легкие салаты'
    },
    {
      id: 'soups',
      name: 'Супы',
      description: 'Традиционные азиатские супы'
    },
    {
      id: 'desserts',
      name: 'Десерты',
      description: 'Сладкие завершения трапезы'
    },
    {
      id: 'drinks',
      name: 'Напитки',
      description: 'Освежающие напитки'
    }
  ],
  
  dishes: [
    // Стартеры
    {
      id: 1,
      name: 'Бао с уткой',
      description: 'Булочка бао, утка, овощной соус, морковь, огурец, дайкон, ростки сои, кунжут кимчи и зеленый лук',
      price: 450,
      weight: '220 г',
      category: 'starters',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: true,
      spicy: false,
      vegetarian: false
    },
    {
      id: 2,
      name: 'Утка по-азиатски 1/2',
      description: 'Традиционная утка с хрустящей корочкой и соусом',
      price: 2030,
      weight: '350/90/500/8 шт/130 г',
      category: 'starters',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: true,
      spicy: false,
      vegetarian: false
    },
    
    // Роллы
    {
      id: 3,
      name: 'Итальянский',
      description: 'Снежный краб, огурец, сливочный сыр, нори, рис, соевый соус',
      price: 580,
      weight: '220 г',
      category: 'rolls',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: false,
      spicy: false,
      vegetarian: false
    },
    {
      id: 4,
      name: 'Бостон',
      description: 'Креветка, сливочный сыр, авокадо, огурец, картофель пай, рис, нори, соевый соус',
      price: 580,
      weight: '270 г',
      category: 'rolls',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: false,
      spicy: false,
      vegetarian: false
    },
    {
      id: 5,
      name: 'Американский',
      description: 'Лосось, угорь, сливочный сыр, авокадо, тобико, огурец, соус кабаяки, нори, рис, сухари панко, соевый соус',
      price: 710,
      weight: '310 г',
      category: 'rolls',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: true,
      spicy: false,
      vegetarian: false
    },
    {
      id: 6,
      name: 'Тайга',
      description: 'Тунец, снежный краб, сливочный сыр, японский омлет, рис, нори, спайси соус, соевый соус',
      price: 580,
      weight: '250 г',
      category: 'rolls',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: false,
      spicy: true,
      vegetarian: false
    },
    
    // Дим-самы
    {
      id: 7,
      name: 'Дим-самы с угрем и грибами',
      description: 'Прозрачное тесто из тапиоки, грибы, угорь, лук-порей',
      price: 410,
      weight: '90 г',
      category: 'dumplings',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: false,
      spicy: false,
      vegetarian: false
    },
    
    // Бао
    {
      id: 8,
      name: 'Бао',
      description: 'Нежные булочки бао из пшеничного теста',
      price: 70,
      weight: '70 г',
      category: 'bao',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: false,
      spicy: false,
      vegetarian: true
    },
    
    // Десерты
    {
      id: 9,
      name: 'Утенок Манго',
      description: 'Мусс манго, кусочки свежего манго, белый шоколад',
      price: 410,
      weight: '90 г',
      category: 'desserts',
      image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: true,
      spicy: false,
      vegetarian: true
    },
    {
      id: 10,
      name: 'Банановый нама',
      description: 'Молочный шоколад, какао, банан',
      price: 330,
      weight: '80 г',
      category: 'desserts',
      image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: false,
      spicy: false,
      vegetarian: true
    },
    
    // Напитки
    {
      id: 11,
      name: 'Лимонад "Клубника/Бузина"',
      description: 'Освежающий лимонад с натуральными ягодами',
      price: 380,
      weight: '330 мл',
      category: 'drinks',
      image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: false,
      spicy: false,
      vegetarian: true
    },
    
    // Дополнительно
    {
      id: 12,
      name: 'Васаби',
      description: 'Острый японский хрен',
      price: 30,
      weight: '5 г',
      category: 'starters',
      image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: false,
      spicy: true,
      vegetarian: true
    },
    {
      id: 13,
      name: 'Имбирь',
      description: 'Маринованный имбирь',
      price: 40,
      weight: '15 г',
      category: 'starters',
      image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: false,
      spicy: false,
      vegetarian: true
    },
    
    // Супы
    {
      id: 14,
      name: 'Том Ям',
      description: 'Острый суп с креветками, грибами и кокосовым молоком',
      price: 450,
      weight: '350 мл',
      category: 'soups',
      image: 'https://images.unsplash.com/photo-1563379091339-03246963d4a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: true,
      spicy: true,
      vegetarian: false
    },
    {
      id: 15,
      name: 'Суп Том Кха',
      description: 'Кокосовый суп с курицей и грибами',
      price: 380,
      weight: '350 мл',
      category: 'soups',
      image: 'https://images.unsplash.com/photo-1563379091339-03246963d4a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: false,
      spicy: false,
      vegetarian: false
    },
    {
      id: 16,
      name: 'Мисо суп',
      description: 'Традиционный японский суп с тофу и водорослями',
      price: 180,
      weight: '250 мл',
      category: 'soups',
      image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: false,
      spicy: false,
      vegetarian: true
    },
    
    // Горячие блюда
    {
      id: 17,
      name: 'Пад Тай',
      description: 'Жареная рисовая лапша с курицей, яйцом и овощами',
      price: 380,
      weight: '300 г',
      category: 'hot',
      image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: true,
      spicy: false,
      vegetarian: false
    },
    {
      id: 18,
      name: 'Курица в кисло-сладком соусе',
      description: 'Курица в традиционном кисло-сладком соусе с овощами',
      price: 420,
      weight: '280 г',
      category: 'hot',
      image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: false,
      spicy: false,
      vegetarian: false
    },
    
    // Салаты
    {
      id: 19,
      name: 'Салат Цезарь',
      description: 'Классический салат с курицей, сыром и соусом',
      price: 280,
      weight: '200 г',
      category: 'salads',
      image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: false,
      spicy: false,
      vegetarian: false
    },
    {
      id: 20,
      name: 'Салат с авокадо',
      description: 'Свежий салат с авокадо, томатами и зеленью',
      price: 320,
      weight: '180 г',
      category: 'salads',
      image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: false,
      spicy: false,
      vegetarian: true
    },
    
    // Вок блюда
    {
      id: 21,
      name: 'Вок с говядиной',
      description: 'Жареная лапша с говядиной и овощами в воке',
      price: 450,
      weight: '320 г',
      category: 'wok',
      image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: true,
      spicy: false,
      vegetarian: false
    },
    {
      id: 22,
      name: 'Вок с морепродуктами',
      description: 'Лапша с креветками, кальмарами и овощами',
      price: 520,
      weight: '300 г',
      category: 'wok',
      image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: false,
      spicy: false,
      vegetarian: false
    },
    
    // Закуски фрай
    {
      id: 23,
      name: 'Креветки в кляре',
      description: 'Хрустящие креветки в пивном кляре',
      price: 380,
      weight: '150 г',
      category: 'fried',
      image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: false,
      spicy: false,
      vegetarian: false
    },
    {
      id: 24,
      name: 'Спринг роллы',
      description: 'Хрустящие роллы с овощами и курицей',
      price: 280,
      weight: '120 г',
      category: 'fried',
      image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: false,
      spicy: false,
      vegetarian: false
    },
    
    // Дополнительные роллы
    {
      id: 25,
      name: 'Ролл Филадельфия',
      description: 'Лосось, сливочный сыр, огурец, рис, нори',
      price: 420,
      weight: '240 г',
      category: 'rolls',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: true,
      spicy: false,
      vegetarian: false
    },
    {
      id: 26,
      name: 'Ролл Калифорния',
      description: 'Краб, авокадо, огурец, рис, нори',
      price: 350,
      weight: '220 г',
      category: 'rolls',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: false,
      spicy: false,
      vegetarian: false
    },
    
    // Дополнительные напитки
    {
      id: 27,
      name: 'Зеленый чай',
      description: 'Традиционный японский зеленый чай',
      price: 120,
      weight: '250 мл',
      category: 'drinks',
      image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: false,
      spicy: false,
      vegetarian: true
    },
    {
      id: 28,
      name: 'Мохито',
      description: 'Освежающий коктейль с мятой и лаймом',
      price: 450,
      weight: '300 мл',
      category: 'drinks',
      image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: false,
      spicy: false,
      vegetarian: true
    }
  ]
};
