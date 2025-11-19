// Система управления пользователями и их заказами
import { normalizePhoneNumber } from '../utils/phoneMask.js';

// Получение всех пользователей
export const getUsersData = () => {
  const savedUsers = localStorage.getItem('tomyangbar_users');
  if (savedUsers) {
    return JSON.parse(savedUsers);
  }
  return [];
};

// Сохранение пользователей
const saveUsersData = (users) => {
  localStorage.setItem('tomyangbar_users', JSON.stringify(users));
};

// Поиск пользователя по email
export const findUserByEmail = (email) => {
  const users = getUsersData();
  return users.find(user => user.email === email);
};

// Поиск пользователя по телефону
export const findUserByPhone = (phone) => {
  const users = getUsersData();
  const normalizedPhone = normalizePhoneNumber(phone);
  return users.find(user => normalizePhoneNumber(user.phone) === normalizedPhone);
};

// Поиск пользователя по email или телефону
export const findUserByEmailOrPhone = (identifier) => {
  // Проверяем, является ли идентификатор email
  if (identifier.includes('@')) {
    return findUserByEmail(identifier);
  } else {
    // Иначе ищем по телефону
    return findUserByPhone(identifier);
  }
};

// Поиск пользователя по ID
export const findUserById = (id) => {
  const users = getUsersData();
  return users.find(user => user.id === id);
};

// Проверка существования пользователя по email
export const userExists = (email) => {
  return findUserByEmail(email) !== undefined;
};

// Проверка существования пользователя по телефону
export const userExistsByPhone = (phone) => {
  return findUserByPhone(phone) !== undefined;
};

// Проверка существования пользователя по email или телефону
export const userExistsByEmailOrPhone = (identifier) => {
  return findUserByEmailOrPhone(identifier) !== undefined;
};

// Создание нового пользователя
export const createUser = (userData) => {
  const users = getUsersData();
  
  // Проверяем, не существует ли уже пользователь с таким email
  if (userExists(userData.email)) {
    throw new Error('Пользователь с таким email уже существует');
  }
  
  const newUser = {
    id: Date.now(), // Простой ID на основе времени
    name: userData.name,
    email: userData.email,
    phone: normalizePhoneNumber(userData.phone), // Нормализуем номер телефона
    password: userData.password, // В реальном приложении пароль должен быть зашифрован
    avatar: userData.avatar || null,
    orders: [], // История заказов пользователя
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: null
  };
  
  const updatedUsers = [...users, newUser];
  saveUsersData(updatedUsers);
  
  return newUser;
};

// Аутентификация пользователя по email
export const authenticateUser = (email, password) => {
  const user = findUserByEmail(email);
  
  if (!user) {
    throw new Error('Пользователь не найден');
  }
  
  if (user.password !== password) {
    throw new Error('Неверный пароль');
  }
  
  // Обновляем время последнего входа
  updateUserLastLogin(user.id);
  
  return user;
};

// Аутентификация пользователя по email или телефону
export const authenticateUserByEmailOrPhone = (identifier, password) => {
  const user = findUserByEmailOrPhone(identifier);
  
  if (!user) {
    throw new Error('Пользователь не найден');
  }
  
  if (user.password !== password) {
    throw new Error('Неверный пароль');
  }
  
  // Обновляем время последнего входа
  updateUserLastLogin(user.id);
  
  return user;
};

// Обновление времени последнего входа
export const updateUserLastLogin = (userId) => {
  const users = getUsersData();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex !== -1) {
    users[userIndex].lastLoginAt = new Date().toISOString();
    users[userIndex].updatedAt = new Date().toISOString();
    saveUsersData(users);
  }
};

// Обновление данных пользователя
export const updateUser = (userId, updates) => {
  const users = getUsersData();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex !== -1) {
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveUsersData(users);
    return users[userIndex];
  }
  
  throw new Error('Пользователь не найден');
};

// Добавление заказа в историю пользователя
export const addOrderToUser = (userId, orderData) => {
  const users = getUsersData();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex !== -1) {
    const newOrder = {
      id: orderData.id,
      items: orderData.items,
      total: orderData.total,
      deliveryFee: orderData.deliveryFee,
      finalTotal: orderData.finalTotal,
      status: orderData.status,
      deliveryType: orderData.deliveryType,
      deliveryTime: orderData.deliveryTime,
      paymentMethod: orderData.paymentMethod,
      notes: orderData.notes,
      address: orderData.address,
      createdAt: orderData.createdAt,
      updatedAt: orderData.updatedAt,
      completedAt: orderData.completedAt
    };
    
    users[userIndex].orders = [newOrder, ...users[userIndex].orders];
    users[userIndex].updatedAt = new Date().toISOString();
    saveUsersData(users);
    
    return newOrder;
  }
  
  throw new Error('Пользователь не найден');
};

// Обновление статуса заказа в истории пользователя
export const updateUserOrderStatus = (userId, orderId, newStatus) => {
  const users = getUsersData();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex !== -1) {
    const orderIndex = users[userIndex].orders.findIndex(order => order.id === orderId);
    
    if (orderIndex !== -1) {
      users[userIndex].orders[orderIndex].status = newStatus;
      users[userIndex].orders[orderIndex].updatedAt = new Date().toISOString();
      
      if (newStatus === 'completed') {
        users[userIndex].orders[orderIndex].completedAt = new Date().toISOString();
      }
      
      users[userIndex].updatedAt = new Date().toISOString();
      saveUsersData(users);
      
      return users[userIndex].orders[orderIndex];
    }
  }
  
  throw new Error('Заказ или пользователь не найден');
};

// Получение истории заказов пользователя
export const getUserOrders = (userId) => {
  const user = findUserById(userId);
  return user ? user.orders : [];
};

// Получение статистики пользователя
export const getUserStats = (userId) => {
  const user = findUserById(userId);
  if (!user) return null;
  
  const orders = user.orders;
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.finalTotal, 0);
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  
  // Самые популярные блюда
  const dishCounts = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      dishCounts[item.name] = (dishCounts[item.name] || 0) + item.quantity;
    });
  });
  
  const favoriteDishes = Object.entries(dishCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
  
  return {
    totalOrders,
    totalSpent,
    completedOrders,
    averageOrderValue,
    favoriteDishes,
    memberSince: user.createdAt,
    lastOrder: orders.length > 0 ? orders[0].createdAt : null
  };
};

// Удаление пользователя (для админки)
export const deleteUser = (userId) => {
  const users = getUsersData();
  const filteredUsers = users.filter(user => user.id !== userId);
  saveUsersData(filteredUsers);
};

// Получение всех пользователей для админки
export const getAllUsers = () => {
  return getUsersData().map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    totalOrders: user.orders.length,
    totalSpent: user.orders.reduce((sum, order) => sum + order.finalTotal, 0),
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
  }));
};

// Инициализация тестовых пользователей (только при первом запуске)
export const initializeTestUsers = () => {
  const users = getUsersData();
  if (users.length === 0) {
    const testUsers = [
      {
        id: 1,
        name: 'Админ Тест',
        email: 'admin@test.com',
        phone: '+7 (999) 000-00-01',
        password: 'admin123',
        avatar: null,
        orders: [],
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00',
        lastLoginAt: null
      },
      {
        id: 2,
        name: 'Пользователь Тест',
        email: 'user@test.com',
        phone: '+7 (999) 000-00-02',
        password: 'user123',
        avatar: null,
        orders: [],
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00',
        lastLoginAt: null
      }
    ];
    
    saveUsersData(testUsers);
  }
};
