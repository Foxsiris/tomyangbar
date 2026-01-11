const express = require('express');
const { 
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
  getLoyaltyInfo
} = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Регистрация пользователя
router.post('/register', register);

// Авторизация пользователя
router.post('/login', login);

// Авторизация админа
router.post('/admin/login', adminLogin);

// Получение профиля (требует аутентификации)
router.get('/profile', authenticateToken, getProfile);

// === Система лояльности ===

// Получение информации о лояльности (бонусы, уровень)
router.get('/loyalty', authenticateToken, getLoyaltyInfo);

// Получение истории бонусных транзакций
router.get('/bonuses/history', authenticateToken, getBonusHistory);

// === Поиск пользователей ===

// Поиск пользователя по email
router.get('/email/:email', findByEmail);

// Поиск пользователя по телефону
router.get('/phone/:phone', findByPhone);

// Поиск пользователя по ID
router.get('/:id', findById);

// Обновление пользователя
router.put('/:id', authenticateToken, updateUser);

// Обновление времени последнего входа
router.put('/:id/last-login', authenticateToken, updateLastLogin);

// Получение статистики пользователя
router.get('/:id/stats', authenticateToken, getUserStats);

module.exports = router;
