const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { sendVerificationCode, verifyCode, normalizePhone } = require('../services/smsService');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Константы системы лояльности
const LOYALTY_CONFIG = {
  REGISTRATION_BONUS: 200
};

// Получение названия уровня
const getLoyaltyLevelName = (level) => {
  const names = {
    bronze: '🥉 Бронзовый',
    silver: '🥈 Серебряный',
    gold: '🥇 Золотой'
  };
  return names[level] || '🥉 Бронзовый';
};

// Получение процента кэшбэка
const getCashbackPercent = (level) => {
  const percents = { bronze: 2, silver: 3, gold: 5 };
  return percents[level] || 2;
};

// Получение информации о следующем уровне
const getNextLevelInfo = (currentLevel, totalSpent) => {
  const spent = parseFloat(totalSpent) || 0;
  const levels = {
    bronze: { next: 'silver', threshold: 80000 },
    silver: { next: 'gold', threshold: 100000 },
    gold: { next: null, threshold: null }
  };
  
  const info = levels[currentLevel] || levels.bronze;
  
  if (!info.next) {
    return { hasNext: false, message: 'Вы достигли максимального уровня!' };
  }
  
  return {
    hasNext: true,
    nextLevel: info.next,
    nextLevelName: getLoyaltyLevelName(info.next),
    remaining: info.threshold - spent,
    progress: (spent / info.threshold) * 100
  };
};

/**
 * Отправка кода верификации на телефон
 * POST /api/auth/sms/send-code
 */
const sendCode = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Номер телефона обязателен' });
    }

    const result = await sendVerificationCode(phone);
    
    res.json(result);

  } catch (error) {
    console.error('Send code error:', error);
    res.status(400).json({ error: error.message || 'Ошибка отправки кода' });
  }
};

/**
 * Проверка кода и авторизация/регистрация
 * POST /api/auth/sms/verify
 */
const verify = async (req, res) => {
  try {
    const { phone, code, name } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: 'Телефон и код обязательны' });
    }

    // Проверяем код
    const verification = verifyCode(phone, code);
    if (!verification.valid) {
      return res.status(400).json({ error: verification.error });
    }

    const normalizedPhone = normalizePhone(phone);

    // Ищем пользователя по телефону
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('id, name, email, phone, bonus_balance, total_spent, loyalty_level, created_at')
      .eq('phone', normalizedPhone)
      .single();

    let user;
    let isNewUser = false;

    if (existingUser) {
      // Пользователь существует - авторизуем
      user = existingUser;
    } else {
      // Новый пользователь - регистрируем
      isNewUser = true;
      
      const newUserData = {
        name: name || `Пользователь ${normalizedPhone.slice(-4)}`,
        phone: normalizedPhone,
        email: null,
        password_hash: null, // Для SMS-авторизации пароль не нужен
        bonus_balance: LOYALTY_CONFIG.REGISTRATION_BONUS,
        total_spent: 0,
        loyalty_level: 'bronze'
      };

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([newUserData])
        .select('id, name, email, phone, bonus_balance, total_spent, loyalty_level, created_at')
        .single();

      if (createError) {
        console.error('Create user error:', createError);
        return res.status(500).json({ error: 'Ошибка создания пользователя' });
      }

      user = newUser;

      // Записываем бонусы за регистрацию
      await supabase.from('bonus_transactions').insert([{
        user_id: user.id,
        amount: LOYALTY_CONFIG.REGISTRATION_BONUS,
        type: 'registration',
        description: 'Приветственные бонусы за регистрацию',
        balance_after: LOYALTY_CONFIG.REGISTRATION_BONUS
      }]);

      console.log(`🎁 Новый пользователь ${user.name} зарегистрирован через SMS и получил ${LOYALTY_CONFIG.REGISTRATION_BONUS} бонусов`);
    }

    // Создаем JWT токен
    const token = jwt.sign(
      { userId: user.id, phone: user.phone },
      JWT_SECRET,
      { expiresIn: '30d' } // Для SMS-авторизации делаем токен дольше
    );

    // Формируем информацию о лояльности
    const loyaltyInfo = {
      level: user.loyalty_level || 'bronze',
      levelName: getLoyaltyLevelName(user.loyalty_level),
      cashbackPercent: getCashbackPercent(user.loyalty_level || 'bronze'),
      bonusBalance: user.bonus_balance || 0,
      totalSpent: parseFloat(user.total_spent) || 0,
      nextLevel: getNextLevelInfo(user.loyalty_level, user.total_spent)
    };

    res.json({
      success: true,
      isNewUser,
      message: isNewUser ? 'Регистрация успешна' : 'Авторизация успешна',
      user: { ...user, loyaltyInfo },
      token,
      ...(isNewUser ? { bonusMessage: `Вам начислено ${LOYALTY_CONFIG.REGISTRATION_BONUS} приветственных бонусов!` } : {})
    });

  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/**
 * Проверка, существует ли пользователь с таким телефоном
 * GET /api/auth/sms/check/:phone
 */
const checkPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const normalizedPhone = normalizePhone(phone);

    const { data: user } = await supabase
      .from('users')
      .select('id, name')
      .eq('phone', normalizedPhone)
      .single();

    res.json({
      exists: !!user,
      name: user?.name || null
    });

  } catch (error) {
    console.error('Check phone error:', error);
    res.status(500).json({ error: 'Ошибка проверки' });
  }
};

module.exports = {
  sendCode,
  verify,
  checkPhone
};
