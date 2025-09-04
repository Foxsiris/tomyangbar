// API endpoint для создания СБП платежа
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

    // Конфигурация для СБП
    const SBP_CONFIG = {
      // В реальном проекте здесь будут ваши данные для СБП
      merchantId: 'test_merchant_123',
      secretKey: 'test_sbp_secret_key',
      returnUrl: 'https://tomyangbar.vercel.app/payment/sbp/success',
      cancelUrl: 'https://tomyangbar.vercel.app/payment/sbp/cancel',
      isTestMode: true
    };

    // Подготовка данных для СБП
    const sbpData = {
      amount: {
        value: orderData.total.toFixed(2),
        currency: 'RUB'
      },
      orderId: orderData.orderId,
      description: `Заказ #${orderData.orderId} в ресторане Tom Yang Bar`,
      customer: {
        name: orderData.customerName,
        phone: orderData.customerPhone,
        email: orderData.customerEmail
      },
      returnUrl: SBP_CONFIG.returnUrl,
      cancelUrl: SBP_CONFIG.cancelUrl,
      metadata: {
        orderId: orderData.orderId,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerEmail: orderData.customerEmail,
        paymentMethod: 'sbp'
      }
    };

    // В тестовом режиме симулируем создание СБП платежа
    if (SBP_CONFIG.isTestMode) {
      const mockSBPResponse = {
        id: `sbp_${Date.now()}`,
        status: 'pending',
        amount: sbpData.amount,
        orderId: sbpData.orderId,
        qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`, // Заглушка QR кода
        deepLink: `sbp://payment?amount=${sbpData.amount.value}&orderId=${sbpData.orderId}`,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 минут
      };

      console.log('SBP Payment Created (Test Mode):', mockSBPResponse);
      
      return res.status(200).json({
        success: true,
        payment: mockSBPResponse
      });
    }

    // В реальном режиме здесь будет запрос к СБП API
    // const response = await fetch('https://api.sbp.ru/v1/payments', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${SBP_CONFIG.secretKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(sbpData)
    // });

    // if (!response.ok) {
    //   const errorData = await response.json();
    //   return res.status(400).json({ 
    //     error: 'SBP payment creation failed',
    //     details: errorData.message || 'Unknown error'
    //   });
    // }

    // const payment = await response.json();
    // return res.status(200).json({
    //   success: true,
    //   payment: payment
    // });

  } catch (error) {
    console.error('SBP payment creation error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
