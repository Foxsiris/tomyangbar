// Yandex Cloud Function handler для Tom Yang Bar API
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');

// Создаем Express приложение
const app = express();

// Инициализация Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "blob:", "http:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too many requests',
    message: 'Превышен лимит запросов. Попробуйте позже.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Tom Yang Bar API - Cloud Function'
  });
});

// Menu routes
app.get('/api/menu/dishes', async (req, res) => {
  try {
    const { data: dishes, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Get dishes error:', error);
      return res.status(500).json({ error: 'Ошибка при получении блюд' });
    }

    res.json({ dishes });
  } catch (error) {
    console.error('Get dishes error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/menu/categories', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Get categories error:', error);
      return res.status(500).json({ error: 'Ошибка при получении категорий' });
    }

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/menu/full', async (req, res) => {
  try {
    // Получаем категории
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (categoriesError) {
      console.error('Get categories error:', categoriesError);
      return res.status(500).json({ error: 'Ошибка при получении категорий' });
    }

    // Получаем блюда
    const { data: dishes, error: dishesError } = await supabase
      .from('dishes')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (dishesError) {
      console.error('Get dishes error:', dishesError);
      return res.status(500).json({ error: 'Ошибка при получении блюд' });
    }

    const menu = {
      categories: categories || [],
      dishes: dishes || []
    };

    res.json({ menu });
  } catch (error) {
    console.error('Get full menu error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Cart routes
app.post('/api/cart/get-or-create', async (req, res) => {
  try {
    const { sessionId } = req.body || {};

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Ищем существующую корзину
    const { data: existingCart, error: findError } = await supabase
      .from('carts')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      console.error('Find cart error:', findError);
      return res.status(500).json({ error: 'Ошибка при поиске корзины' });
    }

    if (existingCart) {
      return res.json({ cart: existingCart });
    }

    // Создаем новую корзину
    const { data: newCart, error: createError } = await supabase
      .from('carts')
      .insert({
        session_id: sessionId,
        items: [],
        total: 0
      })
      .select()
      .single();

    if (createError) {
      console.error('Create cart error:', createError);
      return res.status(500).json({ error: 'Ошибка при создании корзины' });
    }

    res.json({ cart: newCart });
  } catch (error) {
    console.error('Cart operation error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// User routes (базовые)
app.post('/api/users/register', async (req, res) => {
  try {
    const { email, password, phone, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone,
          name
        }
      }
    });

    if (error) {
      console.error('Registration error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ user: data.user, message: 'Пользователь успешно зарегистрирован' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login error:', error);
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    res.json({ user: data.user, session: data.session });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Order routes (базовые)
app.post('/api/orders', async (req, res) => {
  try {
    const { items, total, customerInfo, sessionId } = req.body;

    if (!items || !total || !customerInfo) {
      return res.status(400).json({ error: 'Неполные данные заказа' });
    }

    const { data, error } = await supabase
      .from('orders')
      .insert({
        items,
        total,
        customer_info: customerInfo,
        session_id: sessionId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Create order error:', error);
      return res.status(500).json({ error: 'Ошибка при создании заказа' });
    }

    res.json({ order: data, message: 'Заказ успешно создан' });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Yandex Cloud Function handler
exports.handler = async (event, context) => {
  return new Promise((resolve) => {
    const { httpMethod, path, headers, body, queryStringParameters } = event;
    
    // Создаем mock request объект
    const req = {
      method: httpMethod,
      url: path,
      headers: headers || {},
      body: body ? JSON.parse(body) : {},
      query: queryStringParameters || {}
    };

    // Создаем mock response объект
    const res = {
      statusCode: 200,
      headers: {},
      body: '',
      json: function(data) {
        this.body = JSON.stringify(data);
        this.headers['Content-Type'] = 'application/json';
      },
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      end: function(data) {
        if (data) this.body = data;
        resolve({
          statusCode: this.statusCode,
          headers: this.headers,
          body: this.body
        });
      }
    };

    // Обрабатываем запрос через Express
    app(req, res);
  });
};
