// API endpoint для проверки статуса СБП платежа
export default async function handler(req, res) {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Обработка preflight запроса
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Только GET запросы
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId } = req.query;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    // В тестовом режиме симулируем проверку статуса
    const mockStatusResponse = {
      id: paymentId,
      status: 'succeeded', // В реальности статус может быть: pending, succeeded, failed, expired
      amount: {
        value: '1000.00',
        currency: 'RUB'
      },
      orderId: paymentId.replace('sbp_', ''),
      created_at: new Date().toISOString(),
      paid_at: new Date().toISOString()
    };

    console.log('SBP Payment Status (Test Mode):', mockStatusResponse);
    
    return res.status(200).json({
      success: true,
      payment: mockStatusResponse
    });

    // В реальном режиме здесь будет запрос к СБП API
    // const response = await fetch(`https://api.sbp.ru/v1/payments/${paymentId}`, {
    //   method: 'GET',
    //   headers: {
    //     'Authorization': `Bearer ${SBP_CONFIG.secretKey}`,
    //     'Content-Type': 'application/json'
    //   }
    // });

    // if (!response.ok) {
    //   const errorData = await response.json();
    //   return res.status(400).json({ 
    //     error: 'SBP status check failed',
    //     details: errorData.message || 'Unknown error'
    //   });
    // }

    // const payment = await response.json();
    // return res.status(200).json({
    //   success: true,
    //   payment: payment
    // });

  } catch (error) {
    console.error('SBP status check error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
