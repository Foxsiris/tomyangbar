// Конфигурация для YooKassa (бывший Яндекс.Касса)

// ВНИМАНИЕ: В продакшене эти данные должны быть на сервере!
// Для демонстрации используем тестовые данные

export const PAYMENT_CONFIG = {
  // Тестовые данные для демонстрации
  // В реальном проекте shopId и secretKey должны быть на сервере
  shopId: '1158814', // Замените на ваш реальный shopId
  secretKey: 'test_oa3ugm0nFNCbbN-fIuWXtY_GiLVkLL5DgCbyZSwNVA8', // Замените на ваш реальный secretKey
  
  // Настройки для тестового режима
  isTestMode: true,
  
  // ВАЖНО: В тестовом режиме YooKassa доступны не все методы оплаты
  // Доступны: банковские карты, ЮMoney
  // НЕ доступны: СБП, SberPay, QIWI, WebMoney (требуют активации в продакшене)
  
  // Валюта
  currency: 'RUB',
  
  // Режим платежей
  // capture: true - одностадийный платеж (сразу списание)
  // capture: false - двухстадийный платеж (сначала авторизация, потом подтверждение)
  capture: true,
  
  // Настройки уведомлений
  notificationUrl: `${window.location.origin}/api/payment/notification`,
  returnUrl: `${window.location.origin}/payment/success`,
  cancelUrl: `${window.location.origin}/payment/cancel`,
  
  // Настройки для разных способов оплаты
  // ВАЖНО: В тестовом режиме доступны только базовые методы
  paymentMethods: {
    bank_card: {
      enabled: true,
      name: 'Банковская карта',
      description: 'Оплата банковской картой',
      availableInTest: true // Доступно в тестовом режиме
    },
    yoo_money: {
      enabled: true,
      name: 'ЮMoney',
      description: 'Оплата через ЮMoney',
      availableInTest: true // Доступно в тестовом режиме
    },
    qiwi: {
      enabled: false, // Отключено в тестовом режиме
      name: 'QIWI',
      description: 'Оплата через QIWI (только в продакшене)',
      availableInTest: false
    },
    webmoney: {
      enabled: false, // Отключено в тестовом режиме
      name: 'WebMoney',
      description: 'Оплата через WebMoney (только в продакшене)',
      availableInTest: false
    },
    alfabank: {
      enabled: false, // Отключено в тестовом режиме
      name: 'Альфа-Клик',
      description: 'Оплата через Альфа-Клик (только в продакшене)',
      availableInTest: false
    },
    sberbank: {
      enabled: false, // Отключено в тестовом режиме
      name: 'Сбербанк Онлайн',
      description: 'Оплата через Сбербанк Онлайн (только в продакшене)',
      availableInTest: false
    },
    sbp: {
      enabled: false, // Отключено в тестовом режиме
      name: 'СБП (Система быстрых платежей)',
      description: 'Оплата через СБП (только в продакшене)',
      availableInTest: false
    },
    sberpay: {
      enabled: false, // Отключено в тестовом режиме
      name: 'SberPay',
      description: 'Оплата через SberPay (только в продакшене)',
      availableInTest: false
    }
  }
};

// Функция для получения доступных методов оплаты в зависимости от режима
export const getAvailablePaymentMethods = () => {
  const methods = [];
  
  Object.entries(PAYMENT_CONFIG.paymentMethods).forEach(([key, method]) => {
    // В тестовом режиме показываем только доступные методы
    if (PAYMENT_CONFIG.isTestMode) {
      if (method.availableInTest) {
        methods.push({ key, ...method });
      }
    } else {
      // В продакшене показываем все включенные методы
      if (method.enabled) {
        methods.push({ key, ...method });
      }
    }
  });
  
  return methods;
};

// Функция для проверки доступности метода оплаты
export const isPaymentMethodAvailable = (methodKey) => {
  const method = PAYMENT_CONFIG.paymentMethods[methodKey];
  if (!method) return false;
  
  if (PAYMENT_CONFIG.isTestMode) {
    return method.availableInTest;
  } else {
    return method.enabled;
  }
};

// Функция для создания платежа
export const createPayment = async (orderData) => {
  try {
    // Формируем returnUrl с параметрами заказа
    const returnUrl = `${window.location.origin}/payment/success?order_id=${orderData.orderId}`;
    const cancelUrl = `${window.location.origin}/payment/cancel?order_id=${orderData.orderId}`;

    // Запрос к нашему API endpoint
    const response = await fetch('/api/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        orderData,
        returnUrl,
        cancelUrl
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Payment API Error:', errorData);
      
      // Специальная обработка для недоступных методов оплаты
      if (errorData.code === 'PAYMENT_METHOD_NOT_AVAILABLE' || errorData.code === 'SBP_NOT_AVAILABLE') {
        throw new Error(`${errorData.error}: ${errorData.details}`);
      }
      
      throw new Error(`Ошибка создания платежа: ${errorData.details || errorData.error || 'Неизвестная ошибка'}`);
    }

    const result = await response.json();
    console.log('Payment Created:', result.payment);
    return result.payment;
    
  } catch (error) {
    console.error('Ошибка при создании платежа:', error);
    throw new Error(`Не удалось создать платеж: ${error.message}`);
  }
};

// Функция для проверки статуса платежа
export const checkPaymentStatus = async (paymentId) => {
  try {
    // Запрос к нашему API endpoint
    const response = await fetch(`/api/payment/status?paymentId=${paymentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Payment Status API Error:', errorData);
      throw new Error(`Ошибка проверки статуса: ${errorData.details || errorData.error || 'Неизвестная ошибка'}`);
    }

    const result = await response.json();
    console.log('Payment Status:', result.payment);
    return result.payment;
    
  } catch (error) {
    console.error('Ошибка при проверке статуса платежа:', error);
    throw new Error(`Не удалось проверить статус платежа: ${error.message}`);
  }
};

// Функция для отмены платежа
export const cancelPayment = async (paymentId) => {
  try {
    // В реальном проекте этот запрос должен идти на ваш сервер
    console.log(`Отмена платежа ${paymentId}`);
    
    return {
      id: paymentId,
      status: 'canceled',
      paid: false
    };
    
  } catch (error) {
    console.error('Ошибка при отмене платежа:', error);
    throw new Error('Не удалось отменить платеж');
  }
};
