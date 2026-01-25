/**
 * SMS Service для отправки сообщений через SMS-Uslugi.ru
 * Документация: https://sms-uslugi.ru/send/rest_api
 */

const SMS_API_URL = 'https://lcab.sms-uslugi.ru/api/v1/send';
const SMS_API_TOKEN = process.env.SMS_API_TOKEN;
const SMS_SENDER_NAME = process.env.SMS_SENDER_NAME || 'TomYangBar';

// Хранилище кодов верификации (в продакшене лучше использовать Redis)
const verificationCodes = new Map();

// Время жизни кода в миллисекундах (5 минут)
const CODE_EXPIRY_TIME = 5 * 60 * 1000;

// Генерация случайного 4-значного кода
const generateCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Нормализация номера телефона (убираем всё кроме цифр)
const normalizePhone = (phone) => {
  let cleaned = phone.replace(/\D/g, '');
  // Если начинается с 8, заменяем на 7
  if (cleaned.startsWith('8') && cleaned.length === 11) {
    cleaned = '7' + cleaned.slice(1);
  }
  // Если без кода страны, добавляем 7
  if (cleaned.length === 10) {
    cleaned = '7' + cleaned;
  }
  return cleaned;
};

/**
 * Отправка SMS через API SMS-Uslugi.ru
 */
const sendSms = async (phone, message) => {
  if (!SMS_API_TOKEN) {
    console.error('SMS_API_TOKEN not configured!');
    // В режиме разработки возвращаем успех без реальной отправки
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📱 [DEV MODE] SMS to ${phone}: ${message}`);
      return { success: true, dev: true };
    }
    throw new Error('SMS сервис не настроен');
  }

  try {
    const response = await fetch(SMS_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SMS_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: normalizePhone(phone),
        message: message,
        sender: SMS_SENDER_NAME
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('SMS API error:', data);
      throw new Error(data.error || 'Ошибка отправки SMS');
    }

    console.log(`📱 SMS sent to ${phone}`);
    return { success: true, data };

  } catch (error) {
    console.error('SMS sending error:', error);
    throw error;
  }
};

/**
 * Отправка кода верификации
 */
const sendVerificationCode = async (phone) => {
  const normalizedPhone = normalizePhone(phone);
  
  // Проверяем, не был ли код отправлен недавно (защита от спама)
  const existing = verificationCodes.get(normalizedPhone);
  if (existing && Date.now() - existing.createdAt < 60000) {
    const secondsLeft = Math.ceil((60000 - (Date.now() - existing.createdAt)) / 1000);
    throw new Error(`Подождите ${secondsLeft} сек. перед повторной отправкой`);
  }

  const code = generateCode();
  const message = `Tom Yang Bar: Ваш код подтверждения: ${code}. Не сообщайте его никому.`;

  // В режиме разработки без API токена просто логируем код
  if (!SMS_API_TOKEN && process.env.NODE_ENV !== 'production') {
    console.log(`\n📱 ===== DEV MODE: SMS CODE =====`);
    console.log(`📱 Phone: ${normalizedPhone}`);
    console.log(`📱 Code: ${code}`);
    console.log(`📱 ================================\n`);
  } else {
    await sendSms(phone, message);
  }

  // Сохраняем код
  verificationCodes.set(normalizedPhone, {
    code,
    createdAt: Date.now(),
    attempts: 0
  });

  // Удаляем код через 5 минут
  setTimeout(() => {
    verificationCodes.delete(normalizedPhone);
  }, CODE_EXPIRY_TIME);

  return { 
    success: true, 
    message: 'Код отправлен',
    // В dev режиме возвращаем код для тестирования
    ...(process.env.NODE_ENV !== 'production' && !SMS_API_TOKEN ? { devCode: code } : {})
  };
};

/**
 * Проверка кода верификации
 * @param {string} phone - номер телефона
 * @param {string} code - код верификации
 * @param {boolean} keepCode - не удалять код после успешной проверки (для двухэтапной верификации)
 */
const verifyCode = (phone, code, keepCode = false) => {
  const normalizedPhone = normalizePhone(phone);
  const stored = verificationCodes.get(normalizedPhone);

  if (!stored) {
    return { valid: false, error: 'Код не найден или истёк. Запросите новый код.' };
  }

  // Проверка на количество попыток
  if (stored.attempts >= 5) {
    verificationCodes.delete(normalizedPhone);
    return { valid: false, error: 'Превышено количество попыток. Запросите новый код.' };
  }

  // Проверка на истечение срока
  if (Date.now() - stored.createdAt > CODE_EXPIRY_TIME) {
    verificationCodes.delete(normalizedPhone);
    return { valid: false, error: 'Код истёк. Запросите новый код.' };
  }

  // Увеличиваем счётчик попыток
  stored.attempts++;

  // Проверка кода
  if (stored.code !== code) {
    return { valid: false, error: 'Неверный код' };
  }

  // Код верный - удаляем только если не нужно сохранять
  if (!keepCode) {
    verificationCodes.delete(normalizedPhone);
  }
  return { valid: true };
};

/**
 * Удаление кода вручную (после успешной регистрации с именем)
 */
const deleteCode = (phone) => {
  const normalizedPhone = normalizePhone(phone);
  verificationCodes.delete(normalizedPhone);
};

/**
 * Очистка просроченных кодов (вызывать периодически)
 */
const cleanupExpiredCodes = () => {
  const now = Date.now();
  for (const [phone, data] of verificationCodes.entries()) {
    if (now - data.createdAt > CODE_EXPIRY_TIME) {
      verificationCodes.delete(phone);
    }
  }
};

// Запускаем очистку каждые 5 минут
setInterval(cleanupExpiredCodes, CODE_EXPIRY_TIME);

module.exports = {
  sendSms,
  sendVerificationCode,
  verifyCode,
  deleteCode,
  normalizePhone
};
