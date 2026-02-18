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
  res.header('Cache-Control', 'public, max-age=86400, immutable'); // Кешируем изображения на 24 часа
  next();
}, express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Функция для получения реального IP пользователя (за nginx/proxy)
const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.ip;
};

// ============================================================
// ВРЕМЕННО ОТКЛЮЧАЕМ RATE LIMITER для диагностики
// ============================================================
// const publicLimiter = rateLimit({ ... });
// const limiter = rateLimit({ ... });
// const adminLimiter = rateLimit({ ... });
// app.use('/api/menu', publicLimiter);
// app.use('/api/cart', publicLimiter);
// app.use('/api/admin', adminLimiter);
// app.use(limiter);
// ============================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ============================================================
// СТАТИСТИКА ЗАПРОСОВ ДЛЯ ДИАГНОСТИКИ
// ============================================================
const requestStats = {
  byIp: new Map(),      // IP -> { count, lastSeen, paths: Map<path, count> }
  byPath: new Map(),    // path -> count
  total: 0,
  startTime: Date.now()
};

// Middleware для сбора статистики
app.use((req, res, next) => {
  const clientIp = getClientIp(req);
  const path = req.path;
  const now = Date.now();
  
  requestStats.total++;
  
  // Статистика по IP
  if (!requestStats.byIp.has(clientIp)) {
    requestStats.byIp.set(clientIp, { 
      count: 0, 
      firstSeen: now,
      lastSeen: now, 
      paths: new Map(),
      recentRequests: [] // последние 100 запросов
    });
  }
  const ipStats = requestStats.byIp.get(clientIp);
  ipStats.count++;
  ipStats.lastSeen = now;
  ipStats.paths.set(path, (ipStats.paths.get(path) || 0) + 1);
  
  // Храним последние 100 запросов с этого IP
  ipStats.recentRequests.push({ path, method: req.method, time: now });
  if (ipStats.recentRequests.length > 100) {
    ipStats.recentRequests.shift();
  }
  
  // Статистика по путям
  requestStats.byPath.set(path, (requestStats.byPath.get(path) || 0) + 1);
  
  // Логируем только каждый 10-й запрос чтобы не спамить
  if (requestStats.total % 10 === 0) {
    console.log(`[STATS] Total: ${requestStats.total} | IP: ${clientIp} (${ipStats.count} total) | ${req.method} ${path}`);
  }
  
  next();
});

// API endpoint для просмотра статистики (доступен в админке)
app.get('/api/admin/request-stats', (req, res) => {
  const now = Date.now();
  const uptimeMinutes = Math.round((now - requestStats.startTime) / 60000);
  
  // Собираем топ IP по количеству запросов
  const topIps = Array.from(requestStats.byIp.entries())
    .map(([ip, stats]) => ({
      ip,
      totalRequests: stats.count,
      firstSeen: new Date(stats.firstSeen).toISOString(),
      lastSeen: new Date(stats.lastSeen).toISOString(),
      topPaths: Array.from(stats.paths.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([path, count]) => ({ path, count })),
      recentRequests: stats.recentRequests.slice(-20).map(r => ({
        ...r,
        time: new Date(r.time).toISOString()
      }))
    }))
    .sort((a, b) => b.totalRequests - a.totalRequests)
    .slice(0, 20);
  
  // Топ путей
  const topPaths = Array.from(requestStats.byPath.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([path, count]) => ({ path, count }));
  
  res.json({
    uptimeMinutes,
    totalRequests: requestStats.total,
    requestsPerMinute: Math.round(requestStats.total / Math.max(uptimeMinutes, 1)),
    uniqueIps: requestStats.byIp.size,
    topIps,
    topPaths
  });
});

// Endpoint для сброса статистики
app.post('/api/admin/request-stats/reset', (req, res) => {
  requestStats.byIp.clear();
  requestStats.byPath.clear();
  requestStats.total = 0;
  requestStats.startTime = Date.now();
  res.json({ message: 'Статистика сброшена' });
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
