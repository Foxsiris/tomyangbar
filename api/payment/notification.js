// API endpoint для обработки webhook'ов от YooKassa
export default async function handler(req, res) {
  // Только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { object, event } = req.body;

    console.log('YooKassa Webhook received:', { event, object });

    // Проверяем тип события
    if (event === 'payment.succeeded') {
      console.log('Payment succeeded:', object.id);
      
      // Здесь можно обновить статус заказа в базе данных
      // Например, отправить уведомление администратору
      // или обновить статус заказа в системе
      
    } else if (event === 'payment.canceled') {
      console.log('Payment canceled:', object.id);
      
      // Обработка отмененного платежа
      
    } else if (event === 'payment.waiting_for_capture') {
      console.log('Payment waiting for capture:', object.id);
      
      // Обработка платежа, ожидающего подтверждения
      // (для двухстадийных платежей)
    }

    // YooKassa ожидает ответ 200 OK
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
