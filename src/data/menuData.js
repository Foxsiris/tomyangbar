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
      image: '/images/bao-duck.jpg',
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
      image: '/images/duck-asian.jpg',
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
      image: '/images/italian-roll.jpg',
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
      image: '/images/boston-roll.jpg',
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
      image: '/images/american-roll.jpg',
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
      image: '/images/taiga-roll.jpg',
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
      image: '/images/dimsum-eel.jpg',
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
      image: '/images/bao-buns.jpg',
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
      image: '/images/mango-dessert.jpg',
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
      image: '/images/banana-nama.jpg',
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
      image: '/images/strawberry-lemonade.jpg',
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
      image: '/images/wasabi.jpg',
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
      image: '/images/ginger.jpg',
      popular: false,
      spicy: false,
      vegetarian: true
    }
  ]
};
