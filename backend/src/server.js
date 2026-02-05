const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const menuRoutes = require('./routes/menuRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const iikoRoutes = require('./routes/iikoRoutes');
const vacancyRoutes = require('./routes/vacancyRoutes');
const newsRoutes = require('./routes/newsRoutes');
const smsAuthRoutes = require('./routes/smsAuthRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// ВАЖНО: Доверяем прокси (nginx), чтобы получать реальный IP пользователя
// Без этого все пользователи видятся как один IP (IP nginx контейнера)
app.set('trust proxy', 1);

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
// CORS настройки для локальной разработки и продакшена
const corsOptions = {
  origin: function (origin, callback) {
    // В режиме разработки разрешаем все источники
    if (process.env.NODE_ENV === 'development' || !process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    
    // В продакшене проверяем разрешенные домены
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Статическая раздача загруженных файлов — ДО rate limiter, чтобы картинки не лимитировались
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Функция для получения реального IP пользователя (за nginx/proxy)
const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.ip;
};

// Мягкий лимитер для публичных endpoints (menu, cart) — без лимита для GET запросов
const publicLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 300, // 300 запросов в минуту на пользователя
  message: {
    error: 'Too many requests',
    message: 'Превышен лимит запросов. Попробуйте позже.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp, // Используем реальный IP пользователя
  skip: (req) => req.method === 'GET' // GET запросы не лимитируем
});

// Более строгий лимитер для остальных endpoints
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 100, // 100 запросов в минуту на пользователя
  message: {
    error: 'Too many requests',
    message: 'Превышен лимит запросов. Попробуйте позже.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp // Используем реальный IP пользователя
});

// Применяем мягкий лимитер для публичных endpoints ПЕРЕД основным
app.use('/api/menu', publicLimiter);
app.use('/api/cart', publicLimiter);

// Применяем основной лимитер ко всем остальным путям
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Debug: Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/iiko', iikoRoutes);
app.use('/api/vacancies', vacancyRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/auth/sms', smsAuthRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Tom Yang Bar API'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Tom Yang Bar API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5174'}`);
});
