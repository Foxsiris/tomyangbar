const express = require('express');
const { createOrder, getUserOrders, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Создание заказа (опциональная аутентификация для гостей)
router.post('/', optionalAuth, createOrder);

// Получение всех заказов (для админа)
router.get('/', authenticateToken, getAllOrders);

// Получение заказов пользователя (требует аутентификации)
router.get('/user', authenticateToken, getUserOrders);

// Обновление статуса заказа
router.put('/:orderId/status', authenticateToken, updateOrderStatus);

module.exports = router;
