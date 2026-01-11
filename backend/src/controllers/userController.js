const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Константы системы лояльности
const LOYALTY_CONFIG = {
  REGISTRATION_BONUS: 200, // Бонусы за регистрацию
  LEVELS: {
    bronze: { minSpent: 0, cashbackPercent: 2 },
    silver: { minSpent: 80000, cashbackPercent: 3 },
    gold: { minSpent: 100000, cashbackPercent: 5 }
  }
};

// Функция для расчета уровня лояльности
const calculateLoyaltyLevel = (totalSpent) => {
  if (totalSpent >= LOYALTY_CONFIG.LEVELS.gold.minSpent) return 'gold';
  if (totalSpent >= LOYALTY_CONFIG.LEVELS.silver.minSpent) return 'silver';
  return 'bronze';
};

// Функция для получения процента кэшбэка
const getCashbackPercent = (level) => {
  return LOYALTY_CONFIG.LEVELS[level]?.cashbackPercent || 2;
};

// Получение названия уровня на русском
const getLoyaltyLevelName = (level) => {
  const names = {
    bronze: '🥉 Бронзовый',
    silver: '🥈 Серебряный',
    gold: '🥇 Золотой'
  };
  return names[level] || '🥉 Бронзовый';
};

// Получение информации о следующем уровне
const getNextLevelInfo = (currentLevel, totalSpent) => {
  const spent = parseFloat(totalSpent) || 0;
  
  if (currentLevel === 'gold') {
    return { hasNext: false, message: 'Вы достигли максимального уровня!' };
  }
  
  if (currentLevel === 'silver') {
    const remaining = LOYALTY_CONFIG.LEVELS.gold.minSpent - spent;
    return {
      hasNext: true,
      nextLevel: 'gold',
      nextLevelName: '🥇 Золотой',
      remaining: remaining,
      progress: (spent / LOYALTY_CONFIG.LEVELS.gold.minSpent) * 100
    };
  }
  
  // bronze
  const remaining = LOYALTY_CONFIG.LEVELS.silver.minSpent - spent;
  return {
    hasNext: true,
    nextLevel: 'silver',
    nextLevelName: '🥈 Серебряный',
    remaining: remaining,
    progress: (spent / LOYALTY_CONFIG.LEVELS.silver.minSpent) * 100
  };
};

// Регистрация пользователя
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Валидация входных данных
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }

    // Проверяем, существует ли пользователь
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Создаем пользователя с начальными бонусами
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          phone,
          password_hash: password,
          bonus_balance: LOYALTY_CONFIG.REGISTRATION_BONUS,
          total_spent: 0,
          loyalty_level: 'bronze',
          registration_bonus_given: true,
          created_at: new Date().toISOString()
        }
      ])
      .select('id, name, email, phone, bonus_balance, total_spent, loyalty_level, created_at')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Ошибка при создании пользователя' });
    }

    // Записываем транзакцию бонусов за регистрацию
    await supabase.from('bonus_transactions').insert([{
      user_id: newUser.id,
      amount: LOYALTY_CONFIG.REGISTRATION_BONUS,
      type: 'registration',
      description: 'Приветственные бонусы за регистрацию',
      balance_after: LOYALTY_CONFIG.REGISTRATION_BONUS
    }]);

    // Создаем JWT токен
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`🎁 Новый пользователь ${name} получил ${LOYALTY_CONFIG.REGISTRATION_BONUS} бонусов за регистрацию`);

    // Добавляем информацию о системе лояльности для нового пользователя
    const loyaltyInfo = {
      level: 'bronze',
      levelName: getLoyaltyLevelName('bronze'),
      cashbackPercent: getCashbackPercent('bronze'),
      bonusBalance: LOYALTY_CONFIG.REGISTRATION_BONUS,
      totalSpent: 0,
      nextLevel: getNextLevelInfo('bronze', 0)
    };

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: { ...newUser, loyaltyInfo },
      token,
      bonusMessage: `Вам начислено ${LOYALTY_CONFIG.REGISTRATION_BONUS} приветственных бонусов!`
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Авторизация пользователя
const login = async (req, res) => {
  try {
    const { email, password, identifier } = req.body;

    // Поддерживаем как email, так и identifier (email или телефон)
    const loginField = identifier || email;
    if (!loginField || !password) {
      return res.status(400).json({ error: 'Email/телефон и пароль обязательны' });
    }

    let query = supabase
      .from('users')
      .select('id, name, email, phone, password_hash, bonus_balance, total_spent, loyalty_level, created_at');

    // Определяем, это email или телефон
    if (loginField.includes('@')) {
      query = query.eq('email', loginField);
    } else {
      query = query.eq('phone', loginField);
    }

    const { data: user, error } = await query.single();

    if (error || !user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Прямая проверка пароля без хеширования
    if (!user.password_hash || user.password_hash !== password) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Создаем JWT токен
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Убираем пароль из ответа
    const { password_hash, ...userWithoutPassword } = user;

    // Добавляем информацию о системе лояльности
    const loyaltyInfo = {
      level: user.loyalty_level || 'bronze',
      levelName: getLoyaltyLevelName(user.loyalty_level),
      cashbackPercent: getCashbackPercent(user.loyalty_level || 'bronze'),
      bonusBalance: user.bonus_balance || 0,
      totalSpent: parseFloat(user.total_spent) || 0,
      nextLevel: getNextLevelInfo(user.loyalty_level, user.total_spent)
    };

    res.json({
      message: 'Успешная авторизация',
      user: { ...userWithoutPassword, loyaltyInfo },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Авторизация админа
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Находим админа
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, name, email, password_hash, is_active')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !admin) {
      return res.status(401).json({ error: 'Неверные данные для входа' });
    }

    // Проверяем пароль (временно для совместимости с существующими данными)
    if (password !== admin.password_hash) {
      return res.status(401).json({ error: 'Неверные данные для входа' });
    }

    // Создаем JWT токен
    const token = jwt.sign(
      { userId: admin.id, email: admin.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Убираем пароль из ответа
    const { password_hash, ...adminWithoutPassword } = admin;

    res.json({
      message: 'Успешная авторизация админа',
      user: { ...adminWithoutPassword, role: 'admin' },
      token
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Получение профиля пользователя
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, phone, bonus_balance, total_spent, loyalty_level, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Добавляем информацию о системе лояльности
    const loyaltyInfo = {
      level: user.loyalty_level || 'bronze',
      levelName: getLoyaltyLevelName(user.loyalty_level),
      cashbackPercent: getCashbackPercent(user.loyalty_level || 'bronze'),
      bonusBalance: user.bonus_balance || 0,
      totalSpent: parseFloat(user.total_spent) || 0,
      nextLevel: getNextLevelInfo(user.loyalty_level, user.total_spent)
    };

    res.json({ user: { ...user, loyaltyInfo } });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Поиск пользователя по email
const findByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, phone, created_at')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Ошибка при поиске пользователя' });
    }

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Find by email error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Поиск пользователя по телефону
const findByPhone = async (req, res) => {
  try {
    const { phone } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, phone, created_at')
      .eq('phone', phone)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Ошибка при поиске пользователя' });
    }

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Find by phone error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Поиск пользователя по ID
const findById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, phone, bonus_balance, total_spent, loyalty_level, created_at')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Ошибка при поиске пользователя' });
    }

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Добавляем информацию о системе лояльности
    const loyaltyInfo = {
      level: user.loyalty_level || 'bronze',
      levelName: getLoyaltyLevelName(user.loyalty_level),
      cashbackPercent: getCashbackPercent(user.loyalty_level || 'bronze'),
      bonusBalance: user.bonus_balance || 0,
      totalSpent: parseFloat(user.total_spent) || 0,
      nextLevel: getNextLevelInfo(user.loyalty_level, user.total_spent)
    };

    res.json({ user: { ...user, loyaltyInfo } });

  } catch (error) {
    console.error('Find by ID error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Обновление пользователя
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Убираем поля, которые нельзя обновлять
    delete updates.id;
    delete updates.password_hash;
    delete updates.created_at;

    const { data: user, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, name, email, phone, created_at, updated_at')
      .single();

    if (error) {
      console.error('Update user error:', error);
      return res.status(500).json({ error: 'Ошибка при обновлении пользователя' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Обновление времени последнего входа
const updateLastLogin = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .update({ 
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Update last login error:', error);
      return res.status(500).json({ error: 'Ошибка при обновлении времени входа' });
    }

    res.json({ message: 'Время входа обновлено' });

  } catch (error) {
    console.error('Update last login error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Получение статистики пользователя
const getUserStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Получаем заказы пользователя
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', id);

    if (ordersError) {
      console.error('Get user orders error:', ordersError);
      return res.status(500).json({ error: 'Ошибка при получении заказов' });
    }

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.final_total), 0);
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Получаем популярные блюда
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('dish_name, quantity')
      .in('order_id', orders.map(o => o.id));

    if (itemsError) {
      console.error('Get order items error:', itemsError);
      return res.status(500).json({ error: 'Ошибка при получении элементов заказов' });
    }

    const dishCounts = {};
    orderItems.forEach(item => {
      dishCounts[item.dish_name] = (dishCounts[item.dish_name] || 0) + item.quantity;
    });

    const favoriteDishes = Object.entries(dishCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const stats = {
      totalOrders,
      totalSpent,
      completedOrders,
      averageOrderValue,
      favoriteDishes,
      memberSince: orders[0]?.created_at || null,
      lastOrder: orders[0]?.created_at || null
    };

    res.json({ stats });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Получение истории бонусных транзакций
const getBonusHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, offset = 0 } = req.query;

    const { data: transactions, error } = await supabase
      .from('bonus_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get bonus history error:', error);
      return res.status(500).json({ error: 'Ошибка при получении истории бонусов' });
    }

    res.json({ transactions });
  } catch (error) {
    console.error('Get bonus history error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Получение информации о системе лояльности
const getLoyaltyInfo = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: user, error } = await supabase
      .from('users')
      .select('bonus_balance, total_spent, loyalty_level')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const loyaltyInfo = {
      level: user.loyalty_level || 'bronze',
      levelName: getLoyaltyLevelName(user.loyalty_level),
      cashbackPercent: getCashbackPercent(user.loyalty_level || 'bronze'),
      bonusBalance: user.bonus_balance || 0,
      totalSpent: parseFloat(user.total_spent) || 0,
      nextLevel: getNextLevelInfo(user.loyalty_level, user.total_spent),
      levelThresholds: LOYALTY_CONFIG.LEVELS
    };

    res.json({ loyaltyInfo });
  } catch (error) {
    console.error('Get loyalty info error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  getProfile,
  findByEmail,
  findByPhone,
  findById,
  updateUser,
  updateLastLogin,
  getUserStats,
  getBonusHistory,
  getLoyaltyInfo,
  // Экспортируем константы и хелперы для использования в других модулях
  LOYALTY_CONFIG,
  calculateLoyaltyLevel,
  getCashbackPercent,
  getLoyaltyLevelName
};
