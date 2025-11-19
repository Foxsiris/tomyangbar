const express = require('express');
const { 
  getOrCreateCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} = require('../controllers/cartController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Получение или создание корзины
router.post('/get-or-create', optionalAuth, getOrCreateCart);

// Добавление товара в корзину
router.post('/add', optionalAuth, addToCart);

// Обновление количества товара в корзине
router.put('/items/:itemId', optionalAuth, updateCartItem);

// Удаление товара из корзины
router.delete('/items/:itemId', optionalAuth, removeFromCart);

// Очистка корзины
router.delete('/:cartId/clear', optionalAuth, clearCart);

module.exports = router;
