const express = require('express');
const router = express.Router();

// Конфигурация YooKassa
const PAYMENT_CONFIG = {
  shopId: process.env.YOOKASSA_SHOP_ID || '1158814',
  secretKey: process.env.YOOKASSA_SECRET_KEY || 'test_oa3ugm0nFNCbbN-fIuWXtY_GiLVkLL5DgCbyZSwNVA8',
  currency: 'RUB'
};

// Создание платежа
router.post('/create', async (req, res) => {
  try {
    const { orderData, returnUrl, cancelUrl } = req.body;

    if (!orderData) {
      return res.status(400).json({ error: 'Order data is required' });
    }

    // Формируем описание заказа
    const description = `Заказ #${orderData.orderId || orderData.order_number || 'N/A'}`;
    
    // Подготовка данных для YooKassa
    const paymentData = {
      amount: {
        value: (orderData.total || orderData.final_total || 0).toFixed(2),
        currency: PAYMENT_CONFIG.currency
      },
      confirmation: {
        type: 'redirect',
        return_url: returnUrl || `${req.protocol}://${req.get('host')}/payment/success`
      },
      capture: true,
      description,
      metadata: {
        orderId: orderData.orderId || orderData.order_number,
        customerName: orderData.customerName || orderData.customer_name
      }
    };

    // Добавляем чек, если есть данные
    if (orderData.items && Array.isArray(orderData.items)) {
      paymentData.receipt = {
        customer: {
          email: orderData.email || orderData.customerEmail,
          phone: orderData.phone || orderData.customerPhone
        },
        items: orderData.items.map(item => ({
          description: item.dish_name || item.name,
          quantity: item.quantity.toString(),
          amount: {
            value: ((item.price || 0) * (item.quantity || 1)).toFixed(2),
            currency: PAYMENT_CONFIG.currency
          },
          vat_code: 1 // НДС 20%
        }))
      };
    }

    // Создание платежа в YooKassa
    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${PAYMENT_CONFIG.shopId}:${PAYMENT_CONFIG.secretKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': `order_${orderData.orderId || orderData.order_number || Date.now()}_${Date.now()}`
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('YooKassa API Error:', errorData);
      
      return res.status(400).json({ 
        error: 'Payment creation failed',
        details: errorData.description || 'Unknown error',
        code: errorData.code
      });
    }

    const payment = await response.json();
    console.log('YooKassa Payment Created:', payment);

    // Возвращаем данные платежа клиенту
    res.json({
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
    res.status(500).json({ 
      error: 'Ошибка при создании платежа',
      details: error.message 
    });
  }
});

// Проверка статуса платежа
router.get('/status', async (req, res) => {
  try {
    const { paymentId } = req.query;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    const response = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${PAYMENT_CONFIG.shopId}:${PAYMENT_CONFIG.secretKey}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(400).json({ 
        error: 'Payment status check failed',
        details: errorData.description || 'Unknown error'
      });
    }

    const payment = await response.json();

    res.json({
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        paid: payment.paid
      }
    });

  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ 
      error: 'Ошибка при проверке статуса платежа',
      details: error.message 
    });
  }
});

// Webhook для уведомлений от YooKassa
router.post('/notification', async (req, res) => {
  try {
    const { event, object } = req.body;

    console.log('Payment notification:', { event, paymentId: object?.id });

    // Здесь можно обновить статус заказа в БД
    // Например, если payment.succeeded, то обновить статус заказа на 'paid'

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Payment notification error:', error);
    res.status(500).json({ error: 'Ошибка обработки уведомления' });
  }
});

module.exports = router;

