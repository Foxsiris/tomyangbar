const express = require('express');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Создание платежа
router.post('/create', optionalAuth, async (req, res) => {
  try {
    console.log('=== PAYMENT CREATE REQUEST START ===');
    console.log('Request method:', req.method);
    console.log('Request body keys:', Object.keys(req.body || {}));
    console.log('Full request body:', JSON.stringify(req.body, null, 2));
    
    const { orderData, returnUrl, cancelUrl } = req.body;

    if (!orderData) {
      console.error('❌ Order data is missing');
      return res.status(400).json({ 
        success: false,
        error: 'Order data is required' 
      });
    }
    
    console.log('✅ Order data received:', {
      orderId: orderData.orderId,
      total: orderData.total,
      itemsCount: orderData.items?.length,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone
    });

    // Конфигурация YooKassa
    const PAYMENT_CONFIG = {
      shopId: '328740',
      secretKey: 'live_s0PMrd9HNq2B09Qy22PCbkl3w6zDQCENcJuEYF-rYTk',
      currency: 'RUB',
      // Используем переданные URL или значения по умолчанию
      returnUrl: returnUrl || 'https://tomyangbar.vercel.app/payment/success',
      cancelUrl: cancelUrl || 'https://tomyangbar.vercel.app/payment/cancel',
      capture: true, // Одностадийный платеж
      isTestMode: false
    };
    
    console.log('Payment request received:', {
      orderId: orderData.orderId,
      total: orderData.total,
      returnUrl: PAYMENT_CONFIG.returnUrl,
      cancelUrl: PAYMENT_CONFIG.cancelUrl
    });

    // Определяем тип платежа (СБП или обычная карта)
    const paymentMethod = orderData.paymentMethod || 'card';
    const isSBP = paymentMethod === 'sbp';

    // Валидация данных заказа
    console.log('Validating order data...');
    if (!orderData.total || orderData.total <= 0) {
      console.error('❌ Invalid order total:', orderData.total);
      return res.status(400).json({
        success: false,
        error: 'Invalid order total',
        details: 'Сумма заказа должна быть больше нуля'
      });
    }
    console.log('✅ Order total is valid:', orderData.total);

    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      console.error('❌ Invalid order items:', orderData.items);
      return res.status(400).json({
        success: false,
        error: 'Invalid order items',
        details: 'Заказ должен содержать хотя бы один товар'
      });
    }
    console.log('✅ Order items are valid, count:', orderData.items.length);

    // Подготовка данных для YooKassa
    const paymentData = {
      amount: {
        value: parseFloat(orderData.total).toFixed(2),
        currency: PAYMENT_CONFIG.currency
      },
      confirmation: {
        type: 'redirect',
        return_url: PAYMENT_CONFIG.returnUrl
      },
      capture: PAYMENT_CONFIG.capture,
      description: `Заказ #${orderData.orderId || 'N/A'} в ресторане Tom Yang Bar`,
      metadata: {
        orderId: orderData.orderId || 'unknown',
        customerName: orderData.customerName || '',
        customerPhone: orderData.customerPhone || '',
        customerEmail: orderData.customerEmail || '',
        paymentMethod: paymentMethod
      }
    };

    // Добавляем receipt только если есть email или phone
    if (orderData.customerEmail || orderData.customerPhone) {
      console.log('Preparing receipt with items:', orderData.items);
      paymentData.receipt = {
        customer: {},
        items: orderData.items.map(item => {
          // Используем dish_name или name в зависимости от того, что есть
          const itemName = item.dish_name || item.name || 'Товар';
          const itemPrice = parseFloat(item.price || 0);
          const itemQuantity = parseFloat(item.quantity || 1);
          const itemTotal = (itemPrice * itemQuantity).toFixed(2);
          
          console.log('Receipt item:', {
            name: itemName,
            price: itemPrice,
            quantity: itemQuantity,
            total: itemTotal
          });
          
          return {
            description: itemName,
            quantity: itemQuantity.toString(),
            amount: {
              value: itemTotal,
              currency: PAYMENT_CONFIG.currency
            },
            vat_code: 1 // НДС 20%
          };
        })
      };
      
      if (orderData.customerEmail) {
        paymentData.receipt.customer.email = orderData.customerEmail;
      }
      if (orderData.customerPhone) {
        paymentData.receipt.customer.phone = orderData.customerPhone;
      }
      
      console.log('Receipt prepared:', JSON.stringify(paymentData.receipt, null, 2));
    }

    console.log('✅ Payment data prepared:', JSON.stringify(paymentData, null, 2));

    // Для всех онлайн-платежей используем Smart Payment (Умный платеж)
    console.log('Setting up Smart Payment...');
    // Это позволяет пользователю выбрать способ оплаты на странице YooKassa
    if (isSBP || paymentMethod === 'card') {
      // Убираем payment_method_data, чтобы YooKassa показал все доступные способы оплаты
      // YooKassa автоматически покажет: карты, СБП, ЮMoney и другие доступные способы
      
      paymentData.confirmation = {
        type: 'redirect',
        return_url: PAYMENT_CONFIG.returnUrl
      };
      
      // Дополнительные настройки для Smart Payment
      paymentData.save_payment_method = false;
      
      console.log('Using YooKassa Smart Payment - user will choose payment method');
    }

    // Создание платежа в YooKassa
    console.log('=== PREPARING YOOKASSA REQUEST ===');
    const idempotenceKey = `order_${orderData.orderId || 'unknown'}_${Date.now()}`;
    console.log('📤 Sending request to YooKassa:', {
      url: 'https://api.yookassa.ru/v3/payments',
      shopId: PAYMENT_CONFIG.shopId,
      idempotenceKey: idempotenceKey,
      amount: paymentData.amount,
      hasReceipt: !!paymentData.receipt,
      itemsCount: paymentData.receipt?.items?.length || 0
    });

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${PAYMENT_CONFIG.shopId}:${PAYMENT_CONFIG.secretKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey
      },
      body: JSON.stringify(paymentData)
    });

    console.log('📥 YooKassa response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Читаем ответ один раз
    const responseText = await response.text();
    console.log('📄 YooKassa raw response:', responseText);

    if (!response.ok) {
      console.error('❌ YooKassa API returned error status:', response.status);
      let errorData;
      try {
        errorData = JSON.parse(responseText);
        console.error('❌ YooKassa API Error (parsed):', JSON.stringify(errorData, null, 2));
      } catch (e) {
        // Если не удалось распарсить JSON, возвращаем текстовую ошибку
        console.error('❌ Failed to parse YooKassa error response:', e);
        return res.status(400).json({ 
          success: false,
          error: 'Payment creation failed',
          details: `Ошибка YooKassa: ${responseText || `HTTP ${response.status}`}`
        });
      }
      
      // Специальная обработка для недоступного способа оплаты
      if (errorData.code === 'payment_method_not_available' || 
          errorData.description?.includes('Payment method is not available')) {
        return res.status(400).json({ 
          success: false,
          error: 'Payment method not available',
          details: 'СБП не включен в настройках магазина YooKassa. Пожалуйста, включите СБП в личном кабинете YooKassa или выберите другой способ оплаты.',
          code: 'SBP_NOT_AVAILABLE'
        });
      }
      
      return res.status(400).json({ 
        success: false,
        error: 'Payment creation failed',
        details: errorData.description || errorData.message || 'Unknown error',
        code: errorData.code
      });
    }

    // Если ответ успешный, парсим его
    let payment;
    try {
      payment = JSON.parse(responseText);
      console.log('✅ YooKassa Payment Created (parsed):', JSON.stringify(payment, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse YooKassa success response:', parseError);
      console.error('Response text was:', responseText);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse payment response',
        details: 'Не удалось обработать ответ от YooKassa'
      });
    }

    // Проверяем, что платеж создан успешно
    if (!payment || !payment.id) {
      console.error('Invalid payment response from YooKassa:', JSON.stringify(payment, null, 2));
      return res.status(500).json({
        success: false,
        error: 'Invalid payment response',
        details: 'YooKassa вернул некорректный ответ',
        rawResponse: payment
      });
    }

    // Проверяем наличие confirmation URL
    if (!payment.confirmation || !payment.confirmation.confirmation_url) {
      console.error('Missing confirmation URL in payment response:', payment);
      return res.status(500).json({
        success: false,
        error: 'Missing confirmation URL',
        details: 'YooKassa не вернул URL для оплаты',
        payment: payment
      });
    }

    console.log('Payment confirmation URL:', payment.confirmation.confirmation_url);

    // Возвращаем данные платежа клиенту
    const responseData = {
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        confirmation: payment.confirmation,
        created_at: payment.created_at
      }
    };
    
    console.log('✅ Sending success response to client:', JSON.stringify(responseData, null, 2));
    console.log('=== PAYMENT CREATE REQUEST SUCCESS ===');
    
    return res.status(200).json(responseData);

  } catch (error) {
    console.error('❌ === PAYMENT CREATE ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Full error:', error);
    console.error('=== END ERROR ===');
    
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Получение статуса платежа
router.get('/status/:paymentId', optionalAuth, async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    // Конфигурация YooKassa
    const PAYMENT_CONFIG = {
      shopId: '328740',
      secretKey: 'live_s0PMrd9HNq2B09Qy22PCbkl3w6zDQCENcJuEYF-rYTk'
    };

    // Проверка статуса платежа в YooKassa
    const response = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${PAYMENT_CONFIG.shopId}:${PAYMENT_CONFIG.secretKey}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('YooKassa API Error:', errorData);
      return res.status(400).json({ 
        error: 'Payment status check failed',
        details: errorData.description || 'Unknown error'
      });
    }

    const payment = await response.json();
    console.log('YooKassa Payment Status:', payment);

    // Возвращаем статус платежа
    return res.status(200).json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        paid: payment.paid,
        amount: payment.amount,
        created_at: payment.created_at,
        captured_at: payment.captured_at
      }
    });

  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ error: 'Ошибка при получении статуса платежа' });
  }
});

// Уведомление о платеже (webhook)
router.post('/notification', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Здесь должна быть обработка webhook от платежной системы
    console.log('Payment notification received:', req.body);
    res.json({ received: true });
  } catch (error) {
    console.error('Payment notification error:', error);
    res.status(500).json({ error: 'Ошибка при обработке уведомления' });
  }
});

module.exports = router;
