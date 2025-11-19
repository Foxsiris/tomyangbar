// API endpoint для проверки статуса платежа
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

    // Конфигурация YooKassa
    const PAYMENT_CONFIG = {
      shopId: '1158814',
      secretKey: 'test_oa3ugm0nFNCbbN-fIuWXtY_GiLVkLL5DgCbyZSwNVA8'
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
    console.error('Payment status check error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
