export const ordersData = [
  {
    id: 1,
    customer: 'Анна К.',
    phone: '+7 (999) 123-45-67',
    email: 'anna@example.com',
    address: 'ул. Чапаева, 15, кв. 23, Саратов',
    items: [
      { id: 14, name: 'Том Ям', quantity: 1, price: 450 },
      { id: 25, name: 'Ролл Филадельфия', quantity: 2, price: 420 },
      { id: 17, name: 'Пад Тай', quantity: 1, price: 380 }
    ],
    total: 1670,
    deliveryFee: 200,
    finalTotal: 1870,
    status: 'pending',
    deliveryType: 'delivery',
    deliveryTime: 'asap',
    paymentMethod: 'cash',
    notes: 'Позвонить перед доставкой',
    createdAt: '2024-01-15T14:30:00',
    updatedAt: '2024-01-15T14:30:00',
    completedAt: null
  },
  {
    id: 2,
    customer: 'Михаил С.',
    phone: '+7 (999) 234-56-78',
    email: 'mikhail@example.com',
    address: 'ул. Пушкина, 8, Саратов',
    items: [
      { id: 15, name: 'Суп Том Кха', quantity: 1, price: 380 },
      { id: 21, name: 'Вок с говядиной', quantity: 1, price: 450 }
    ],
    total: 830,
    deliveryFee: 0,
    finalTotal: 830,
    status: 'preparing',
    deliveryType: 'pickup',
    deliveryTime: 'specific',
    paymentMethod: 'card',
    notes: '',
    createdAt: '2024-01-15T14:25:00',
    updatedAt: '2024-01-15T14:28:00',
    completedAt: null
  },
  {
    id: 3,
    customer: 'Елена В.',
    phone: '+7 (999) 345-67-89',
    email: 'elena@example.com',
    address: 'пр. Мира, 45, кв. 12, Саратов',
    items: [
      { id: 25, name: 'Ролл Филадельфия', quantity: 1, price: 420 },
      { id: 19, name: 'Салат Цезарь', quantity: 1, price: 280 },
      { id: 16, name: 'Мисо суп', quantity: 1, price: 180 }
    ],
    total: 880,
    deliveryFee: 200,
    finalTotal: 1080,
    status: 'delivering',
    deliveryType: 'delivery',
    deliveryTime: 'asap',
    paymentMethod: 'cash',
    notes: 'Код домофона: 1234',
    createdAt: '2024-01-15T14:15:00',
    updatedAt: '2024-01-15T14:20:00',
    completedAt: null
  },
  {
    id: 4,
    customer: 'Дмитрий П.',
    phone: '+7 (999) 456-78-90',
    email: 'dmitry@example.com',
    address: 'ул. Ленина, 67, кв. 5, Саратов',
    items: [
      { id: 5, name: 'Американский', quantity: 1, price: 710 },
      { id: 27, name: 'Зеленый чай', quantity: 2, price: 120 }
    ],
    total: 950,
    deliveryFee: 0,
    finalTotal: 950,
    status: 'completed',
    deliveryType: 'pickup',
    deliveryTime: 'asap',
    paymentMethod: 'card',
    notes: '',
    createdAt: '2024-01-15T13:45:00',
    updatedAt: '2024-01-15T14:10:00',
    completedAt: '2024-01-15T14:10:00'
  },
  {
    id: 5,
    customer: 'Ольга М.',
    phone: '+7 (999) 567-89-01',
    email: 'olga@example.com',
    address: 'ул. Сакко и Ванцетти, 12, кв. 8, Саратов',
    items: [
      { id: 1, name: 'Бао с уткой', quantity: 2, price: 450 },
      { id: 23, name: 'Креветки в кляре', quantity: 1, price: 380 },
      { id: 28, name: 'Мохито', quantity: 1, price: 450 }
    ],
    total: 1730,
    deliveryFee: 0,
    finalTotal: 1730,
    status: 'completed',
    deliveryType: 'pickup',
    deliveryTime: 'specific',
    paymentMethod: 'cash',
    notes: 'Без льда в напитке',
    createdAt: '2024-01-15T13:30:00',
    updatedAt: '2024-01-15T13:55:00',
    completedAt: '2024-01-15T13:55:00'
  },
  {
    id: 6,
    customer: 'Алексей К.',
    phone: '+7 (999) 678-90-12',
    email: 'alexey@example.com',
    address: 'ул. Московская, 89, кв. 15, Саратов',
    items: [
      { id: 14, name: 'Том Ям', quantity: 1, price: 450 },
      { id: 22, name: 'Вок с морепродуктами', quantity: 1, price: 520 },
      { id: 9, name: 'Утенок Манго', quantity: 1, price: 410 }
    ],
    total: 1380,
    deliveryFee: 200,
    finalTotal: 1580,
    status: 'cancelled',
    deliveryType: 'delivery',
    deliveryTime: 'asap',
    paymentMethod: 'cash',
    notes: 'Отменен клиентом',
    createdAt: '2024-01-15T13:15:00',
    updatedAt: '2024-01-15T13:25:00',
    completedAt: null
  },
  {
    id: 7,
    customer: 'Мария С.',
    phone: '+7 (999) 789-01-23',
    email: 'maria@example.com',
    address: 'ул. Рахова, 34, кв. 22, Саратов',
    items: [
      { id: 26, name: 'Ролл Калифорния', quantity: 1, price: 350 },
      { id: 20, name: 'Салат с авокадо', quantity: 1, price: 320 },
      { id: 11, name: 'Лимонад "Клубника/Бузина"', quantity: 1, price: 380 }
    ],
    total: 1050,
    deliveryFee: 0,
    finalTotal: 1050,
    status: 'completed',
    deliveryType: 'pickup',
    deliveryTime: 'asap',
    paymentMethod: 'card',
    notes: '',
    createdAt: '2024-01-15T12:45:00',
    updatedAt: '2024-01-15T13:05:00',
    completedAt: '2024-01-15T13:05:00'
  },
  {
    id: 8,
    customer: 'Сергей В.',
    phone: '+7 (999) 890-12-34',
    email: 'sergey@example.com',
    address: 'ул. Чернышевского, 56, кв. 7, Саратов',
    items: [
      { id: 2, name: 'Утка по-азиатски 1/2', quantity: 1, price: 2030 },
      { id: 18, name: 'Курица в кисло-сладком соусе', quantity: 1, price: 420 },
      { id: 27, name: 'Зеленый чай', quantity: 1, price: 120 }
    ],
    total: 2570,
    deliveryFee: 0,
    finalTotal: 2570,
    status: 'completed',
    deliveryType: 'pickup',
    deliveryTime: 'specific',
    paymentMethod: 'cash',
    notes: 'Дополнительный соус',
    createdAt: '2024-01-15T12:30:00',
    updatedAt: '2024-01-15T12:50:00',
    completedAt: '2024-01-15T12:50:00'
  },
  {
    id: 9,
    customer: 'Ирина Л.',
    phone: '+7 (999) 901-23-45',
    email: 'irina@example.com',
    address: 'ул. Астраханская, 78, кв. 11, Саратов',
    items: [
      { id: 3, name: 'Итальянский', quantity: 1, price: 580 },
      { id: 4, name: 'Бостон', quantity: 1, price: 580 },
      { id: 24, name: 'Спринг роллы', quantity: 1, price: 280 }
    ],
    total: 1440,
    deliveryFee: 200,
    finalTotal: 1640,
    status: 'pending',
    deliveryType: 'delivery',
    deliveryTime: 'asap',
    paymentMethod: 'card',
    notes: 'Вегетарианские роллы',
    createdAt: '2024-01-15T14:35:00',
    updatedAt: '2024-01-15T14:35:00',
    completedAt: null
  },
  {
    id: 10,
    customer: 'Павел Д.',
    phone: '+7 (999) 012-34-56',
    email: 'pavel@example.com',
    address: 'ул. Соборная, 23, кв. 4, Саратов',
    items: [
      { id: 6, name: 'Тайга', quantity: 1, price: 580 },
      { id: 7, name: 'Дим-самы с угрем и грибами', quantity: 1, price: 410 },
      { id: 10, name: 'Банановый нама', quantity: 1, price: 330 }
    ],
    total: 1320,
    deliveryFee: 0,
    finalTotal: 1320,
    status: 'preparing',
    deliveryType: 'pickup',
    deliveryTime: 'asap',
    paymentMethod: 'cash',
    notes: '',
    createdAt: '2024-01-15T14:20:00',
    updatedAt: '2024-01-15T14:25:00',
    completedAt: null
  }
];

// Функции для работы с заказами
export const getOrdersByStatus = (status) => {
  if (status === 'all') return ordersData;
  return ordersData.filter(order => order.status === status);
};

export const getOrdersByDateRange = (startDate, endDate) => {
  return ordersData.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= startDate && orderDate <= endDate;
  });
};

export const getPopularDishes = () => {
  const dishCounts = {};
  
  ordersData.forEach(order => {
    order.items.forEach(item => {
      if (dishCounts[item.name]) {
        dishCounts[item.name].count += item.quantity;
        dishCounts[item.name].revenue += item.price * item.quantity;
      } else {
        dishCounts[item.name] = {
          count: item.quantity,
          revenue: item.price * item.quantity
        };
      }
    });
  });
  
  return Object.entries(dishCounts)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

export const getHourlyStats = () => {
  const hourlyData = {};
  
  ordersData.forEach(order => {
    const hour = new Date(order.createdAt).getHours();
    if (hourlyData[hour]) {
      hourlyData[hour].orders += 1;
      hourlyData[hour].revenue += order.finalTotal;
    } else {
      hourlyData[hour] = { orders: 1, revenue: order.finalTotal };
    }
  });
  
  return Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour.toString().padStart(2, '0')}:00`,
    orders: hourlyData[hour]?.orders || 0,
    revenue: hourlyData[hour]?.revenue || 0
  }));
};

export const getWeeklyStats = () => {
  const weeklyData = {};
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  
  ordersData.forEach(order => {
    const day = days[new Date(order.createdAt).getDay()];
    if (weeklyData[day]) {
      weeklyData[day].orders += 1;
      weeklyData[day].revenue += order.finalTotal;
    } else {
      weeklyData[day] = { orders: 1, revenue: order.finalTotal };
    }
  });
  
  return days.map(day => ({
    day,
    orders: weeklyData[day]?.orders || 0,
    revenue: weeklyData[day]?.revenue || 0
  }));
};

export const getCategoryStats = () => {
  const categoryData = {};
  
  ordersData.forEach(order => {
    order.items.forEach(item => {
      // Определяем категорию по ID блюда (упрощенно)
      let category = 'Другое';
      if ([1, 2, 12, 13].includes(item.id)) category = 'Стартеры';
      else if ([3, 4, 5, 6, 25, 26].includes(item.id)) category = 'Роллы';
      else if ([14, 15, 16].includes(item.id)) category = 'Супы';
      else if ([17, 18].includes(item.id)) category = 'Горячие блюда';
      else if ([19, 20].includes(item.id)) category = 'Салаты';
      else if ([21, 22].includes(item.id)) category = 'Вок';
      else if ([23, 24].includes(item.id)) category = 'Закуски фрай';
      else if ([27, 28, 11].includes(item.id)) category = 'Напитки';
      else if ([9, 10].includes(item.id)) category = 'Десерты';
      
      if (categoryData[category]) {
        categoryData[category].orders += item.quantity;
        categoryData[category].revenue += item.price * item.quantity;
      } else {
        categoryData[category] = { orders: item.quantity, revenue: item.price * item.quantity };
      }
    });
  });
  
  const totalRevenue = Object.values(categoryData).reduce((sum, data) => sum + data.revenue, 0);
  
  return Object.entries(categoryData).map(([name, data]) => ({
    name,
    orders: data.orders,
    revenue: data.revenue,
    percentage: Math.round((data.revenue / totalRevenue) * 100)
  }));
};

export const getOverallStats = () => {
  const totalOrders = ordersData.length;
  const totalRevenue = ordersData.reduce((sum, order) => sum + order.finalTotal, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const activeOrders = ordersData.filter(order => 
    ['pending', 'preparing', 'delivering'].includes(order.status)
  ).length;
  const completedOrders = ordersData.filter(order => order.status === 'completed').length;
  const customerRating = 4.8; // Моковые данные
  const deliveryTime = 45; // Моковые данные
  const repeatCustomers = 68; // Моковые данные
  
  return {
    totalOrders,
    totalRevenue,
    avgOrderValue,
    activeOrders,
    completedOrders,
    customerRating,
    deliveryTime,
    repeatCustomers
  };
};
