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
  paymentMethods: {
    bank_card: {
      enabled: true,
      name: 'Банковская карта',
      description: 'Оплата банковской картой'
    },
    yoo_money: {
      enabled: true,
      name: 'ЮMoney',
      description: 'Оплата через ЮMoney'
    },
    qiwi: {
      enabled: true,
      name: 'QIWI',
      description: 'Оплата через QIWI'
    },
    webmoney: {
      enabled: true,
      name: 'WebMoney',
      description: 'Оплата через WebMoney'
    },
    alfabank: {
      enabled: true,
      name: 'Альфа-Клик',
      description: 'Оплата через Альфа-Клик'
    },
    sberbank: {
      enabled: true,
      name: 'Сбербанк Онлайн',
      description: 'Оплата через Сбербанк Онлайн'
    }
  }
};

// Функция для создания платежа
export const createPayment = async (orderData) => {
  try {
    // В реальном проекте этот запрос должен идти на ваш сервер
    // Здесь мы симулируем создание платежа
    
    const paymentData = {
      amount: {
        value: orderData.total.toFixed(2),
        currency: PAYMENT_CONFIG.currency
      },
      confirmation: {
        type: 'redirect',
        return_url: PAYMENT_CONFIG.returnUrl
      },
      capture: PAYMENT_CONFIG.capture, // Одностадийный платеж - сразу списание с карты
      description: `Заказ #${orderData.orderId} в ресторане Tom Yang Bar`,
      metadata: {
        orderId: orderData.orderId,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerEmail: orderData.customerEmail
      },
      receipt: {
        customer: {
          email: orderData.customerEmail,
          phone: orderData.customerPhone
        },
        items: orderData.items.map(item => ({
          description: item.name,
          quantity: item.quantity.toString(),
          amount: {
            value: (item.price * item.quantity).toFixed(2),
            currency: PAYMENT_CONFIG.currency
          },
          vat_code: 1 // НДС 20%
        }))
      }
    };

    // Симуляция создания платежа
    const mockPayment = {
      id: `payment_${Date.now()}`,
      status: 'pending',
      paid: false,
      amount: paymentData.amount,
      created_at: new Date().toISOString(),
      confirmation: {
        type: 'redirect',
        confirmation_url: `${PAYMENT_CONFIG.returnUrl}?payment_id=payment_${Date.now()}`
      }
    };

    return mockPayment;
    
  } catch (error) {
    console.error('Ошибка при создании платежа:', error);
    throw new Error('Не удалось создать платеж');
  }
};

// Функция для проверки статуса платежа
export const checkPaymentStatus = async (paymentId) => {
  try {
    // В реальном проекте этот запрос должен идти на ваш сервер
    // Здесь мы симулируем проверку статуса
    
    // Симуляция: случайным образом определяем статус
    const statuses = ['pending', 'succeeded', 'canceled'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      id: paymentId,
      status: randomStatus,
      paid: randomStatus === 'succeeded'
    };
    
  } catch (error) {
    console.error('Ошибка при проверке статуса платежа:', error);
    throw new Error('Не удалось проверить статус платежа');
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
