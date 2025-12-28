// Конфигурация для YooKassa (бывший Яндекс.Касса)

export const PAYMENT_CONFIG = {
  // Продакшн данные YooKassa
  shopId: '328740',
  secretKey: 'live_s0PMrd9HNq2B09Qy22PCbkl3w6zDQCENcJuEYF-rYTk',
  
  // Продакшн режим
  isTestMode: false,
  
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
      enabled: true, // Включено в продакшене
      name: 'QIWI',
      description: 'Оплата через QIWI',
      availableInTest: false
    },
    webmoney: {
      enabled: true, // Включено в продакшене
      name: 'WebMoney',
      description: 'Оплата через WebMoney',
      availableInTest: false
    },
    alfabank: {
      enabled: true, // Включено в продакшене
      name: 'Альфа-Клик',
      description: 'Оплата через Альфа-Клик',
      availableInTest: false
    },
    sberbank: {
      enabled: true, // Включено в продакшене
      name: 'Сбербанк Онлайн',
      description: 'Оплата через Сбербанк Онлайн',
      availableInTest: false
    },
    sbp: {
      enabled: true, // Включено в продакшене
      name: 'СБП (Система быстрых платежей)',
      description: 'Оплата через СБП',
      availableInTest: false
    },
    sberpay: {
      enabled: true, // Включено в продакшене
      name: 'SberPay',
      description: 'Оплата через SberPay',
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
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // Если не удалось распарсить JSON, используем текст ответа
        const text = await response.text();
        throw new Error(`Ошибка сервера (${response.status}): ${text || 'Неизвестная ошибка'}`);
      }
      
      console.error('Payment API Error:', errorData);
      
      // Специальная обработка для недоступных методов оплаты
      if (errorData.code === 'PAYMENT_METHOD_NOT_AVAILABLE' || errorData.code === 'SBP_NOT_AVAILABLE') {
        throw new Error(`${errorData.error}: ${errorData.details}`);
      }
      
      throw new Error(`Ошибка создания платежа: ${errorData.details || errorData.error || 'Неизвестная ошибка'}`);
    }

    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      const text = await response.text();
      console.error('Failed to parse JSON response:', text);
      throw new Error(`Ошибка парсинга ответа сервера: ${text}`);
    }
    
    console.log('Payment API Response (full):', JSON.stringify(result, null, 2));
    console.log('Response type check:', {
      isObject: typeof result === 'object',
      hasSuccess: 'success' in result,
      successValue: result?.success,
      hasPayment: 'payment' in result,
      hasError: 'error' in result
    });
    
    // Проверяем структуру ответа
    if (!result) {
      console.error('Empty response from API');
      throw new Error('Пустой ответ от сервера');
    }
    
    // Если ответ содержит ошибку
    if (result.error && result.success !== true) {
      console.error('API returned error:', result);
      throw new Error(result.details || result.error || 'Ошибка создания платежа');
    }
    
    // Если success явно false
    if (result.success === false) {
      console.error('API returned success: false:', result);
      throw new Error(result.details || result.error || 'Ошибка создания платежа');
    }
    
    // Если success === true, продолжаем обработку
    if (result.success === true) {
      console.log('API returned success: true, processing payment data...');
    }
    
    // Проверяем наличие payment в ответе
    // Если payment нет, но success true - это странно, но попробуем обработать
    if (!result.payment) {
      console.warn('⚠️ Payment data missing in response, but success is true');
      console.warn('Full response structure:', JSON.stringify(result, null, 2));
      console.warn('Response keys:', Object.keys(result));
      
      // Если есть данные напрямую в result (не в result.payment)
      if (result.id) {
        console.log('✅ Found payment data directly in result, wrapping it');
        const wrappedPayment = {
          id: result.id,
          status: result.status,
          amount: result.amount,
          confirmation: result.confirmation || { confirmation_url: result.confirmation_url },
          created_at: result.created_at
        };
        console.log('Wrapped payment:', JSON.stringify(wrappedPayment, null, 2));
        return wrappedPayment;
      }
      
      // Если success true, но нет payment - это ошибка
      console.error('❌ Success is true but no payment data found');
      throw new Error(result.details || result.error || 'Данные платежа отсутствуют в ответе сервера');
    }
    
    console.log('✅ Payment data found in response.payment');
    
    // Проверяем наличие обязательных полей
    if (!result.payment.id) {
      console.error('Payment ID missing:', result.payment);
      throw new Error('ID платежа отсутствует в ответе');
    }
    
    // Проверяем confirmation URL в разных возможных местах
    const confirmationUrl = result.payment.confirmation?.confirmation_url || 
                           result.payment.confirmation?.redirect_url ||
                           result.payment.confirmation_url ||
                           result.payment.redirect_url ||
                           result.confirmation?.confirmation_url;
    
    console.log('🔍 Looking for confirmation URL:', {
      'result.payment.confirmation?.confirmation_url': result.payment.confirmation?.confirmation_url,
      'result.payment.confirmation_url': result.payment.confirmation_url,
      'result.confirmation?.confirmation_url': result.confirmation?.confirmation_url,
      'found': confirmationUrl
    });
    
    if (!confirmationUrl) {
      console.error('❌ Confirmation URL missing. Payment object:', JSON.stringify(result.payment, null, 2));
      console.error('Payment confirmation object:', result.payment.confirmation);
      throw new Error('URL для оплаты отсутствует в ответе');
    }
    
    // Убеждаемся, что confirmation объект существует и содержит URL
    if (!result.payment.confirmation) {
      console.log('Creating confirmation object');
      result.payment.confirmation = {
        type: 'redirect',
        confirmation_url: confirmationUrl
      };
    } else if (!result.payment.confirmation.confirmation_url) {
      console.log('Adding confirmation_url to existing confirmation object');
      result.payment.confirmation.confirmation_url = confirmationUrl;
      if (!result.payment.confirmation.type) {
        result.payment.confirmation.type = 'redirect';
      }
    }
    
    console.log('✅ Payment Created successfully:', {
      id: result.payment.id,
      status: result.payment.status,
      confirmationUrl: result.payment.confirmation.confirmation_url,
      fullConfirmation: result.payment.confirmation
    });
    
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
