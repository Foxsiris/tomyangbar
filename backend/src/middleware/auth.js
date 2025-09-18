const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Токен доступа не предоставлен' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('JWT verification error:', err);
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    console.log('JWT verified user:', user);
    req.user = user;
    next();
  });
};

// Middleware для проверки админских прав
const requireAdmin = (req, res, next) => {
  console.log('Admin check - req.user:', req.user);
  console.log('Admin check - req.user.role:', req.user?.role);
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Требуются права администратора' });
  }
  next();
};

// Middleware для опциональной аутентификации (для гостевых заказов)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth
};
