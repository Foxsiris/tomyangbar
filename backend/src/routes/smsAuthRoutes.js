const express = require('express');
const router = express.Router();
const { sendCode, verify, checkPhone } = require('../controllers/smsAuthController');

// Отправка кода верификации
router.post('/send-code', sendCode);

// Проверка кода и авторизация/регистрация
router.post('/verify', verify);

// Проверка существования пользователя по телефону
router.get('/check/:phone', checkPhone);

module.exports = router;
