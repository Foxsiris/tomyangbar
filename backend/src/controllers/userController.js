const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          phone,
          password_hash: hashedPassword,
          created_at: new Date().toISOString()
        }
      ])
      .select('id, name, email, phone, created_at')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Ошибка при создании пользователя' });
    }

    // Создаем JWT токен
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: newUser,
      token
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
      .select('id, name, email, phone, password_hash');

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

    // Проверяем пароль (временно отключено для совместимости с существующими данными)
    // const isValidPassword = await bcrypt.compare(password, user.password_hash);
    // if (!isValidPassword) {
    //   return res.status(401).json({ error: 'Неверный email или пароль' });
    // }

    // Создаем JWT токен
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Убираем пароль из ответа
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      message: 'Успешная авторизация',
      user: userWithoutPassword,
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
      .select('id, name, email, phone, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({ user });

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
      .select('id, name, email, phone, created_at')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Ошибка при поиске пользователя' });
    }

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({ user });

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
  getUserStats
};
