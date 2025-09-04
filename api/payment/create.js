// API endpoint для создания платежа через YooKassa
export default async function handler(req, res) {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Обработка preflight запроса
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderData } = req.body;

    if (!orderData) {
      return res.status(400).json({ error: 'Order data is required' });
    }

    // Конфигурация YooKassa
    const PAYMENT_CONFIG = {
      shopId: '1158814',
      secretKey: 'test_oa3ugm0nFNCbbN-fIuWXtY_GiLVkLL5DgCbyZSwNVA8',
      currency: 'RUB',
      returnUrl: 'https://tomyangbar.vercel.app/payment/success',
      cancelUrl: 'https://tomyangbar.vercel.app/payment/cancel',
      capture: true, // Одностадийный платеж
      isTestMode: true
    };

    // Определяем тип платежа (СБП или обычная карта)
    const paymentMethod = orderData.paymentMethod || 'card';
    const isSBP = paymentMethod === 'sbp';

    // Подготовка данных для YooKassa
    const paymentData = {
      amount: {
        value: orderData.total.toFixed(2),
        currency: PAYMENT_CONFIG.currency
      },
      confirmation: {
        type: 'redirect',
        return_url: PAYMENT_CONFIG.returnUrl
      },
      capture: PAYMENT_CONFIG.capture,
      description: `Заказ #${orderData.orderId} в ресторане Tom Yang Bar`,
      metadata: {
        orderId: orderData.orderId,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerEmail: orderData.customerEmail,
        paymentMethod: paymentMethod
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

    // Если выбран СБП, добавляем специальные настройки для YooKassa
    if (isSBP) {
      paymentData.payment_method_data = {
        type: 'sbp'
      };
      paymentData.confirmation = {
        type: 'redirect',
        return_url: PAYMENT_CONFIG.returnUrl
      };
      
      // Для СБП в YooKassa можно указать дополнительные параметры
      paymentData.save_payment_method = false;
    }

    // Создание платежа в YooKassa
    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${PAYMENT_CONFIG.shopId}:${PAYMENT_CONFIG.secretKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': `order_${orderData.orderId}_${Date.now()}`
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('YooKassa API Error:', errorData);
      return res.status(400).json({ 
        error: 'Payment creation failed',
        details: errorData.description || 'Unknown error'
      });
    }

    const payment = await response.json();
    console.log('YooKassa Payment Created:', payment);

    // Возвращаем данные платежа клиенту
    return res.status(200).json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        confirmation: payment.confirmation,
        created_at: payment.created_at
      }
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
