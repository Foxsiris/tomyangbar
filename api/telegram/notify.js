// API endpoint для отправки уведомлений в Telegram
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
    const { orderData, type = 'new_order' } = req.body;

    if (!orderData) {
      return res.status(400).json({ error: 'Order data is required' });
    }

    // Конфигурация Telegram
    const TELEGRAM_CONFIG = {
      // Ваш личный Chat ID
      chatId: '594704789',
      // Для тестового режима можно использовать фиктивные данные
      isTestMode: true // В продакшене изменить на false
    };

    // В тестовом режиме просто логируем уведомление
    if (TELEGRAM_CONFIG.isTestMode) {
      console.log('📱 TELEGRAM NOTIFICATION (TEST MODE):');
      console.log('Order ID:', orderData.id);
      console.log('Customer:', orderData.customer);
      console.log('Phone:', orderData.phone);
      console.log('Total:', orderData.finalTotal);
      console.log('Status:', orderData.status);
      
      return res.status(200).json({
        success: true,
        message: 'Notification sent (test mode)',
        testMode: true
      });
    }

    // Формируем сообщение для Telegram
    let message = '';
    
    if (type === 'new_order') {
      message = `🆕 *НОВЫЙ ЗАКАЗ #${orderData.id}*

👤 *Клиент:* ${orderData.customer}
📞 *Телефон:* ${orderData.phone}
${orderData.email ? `📧 *Email:* ${orderData.email}\n` : ''}

📍 *Адрес:* ${orderData.deliveryType === 'delivery' ? orderData.address : 'Самовывоз'}

🛒 *Заказ:*
${orderData.items.map(item => `• ${item.name} x${item.quantity} - ${item.price * item.quantity} ₽`).join('\n')}

💰 *Сумма:* ${orderData.finalTotal} ₽
💳 *Оплата:* ${orderData.paymentMethod === 'cash' ? 'Наличные' : 'Карта'}
${orderData.notes ? `📝 *Комментарий:* ${orderData.notes}\n` : ''}

⏰ *Время заказа:* ${new Date(orderData.createdAt).toLocaleString('ru-RU')}

🔗 *Перейти в админку:* https://tomyangbar.vercel.app/admin`;
    } else if (type === 'status_update') {
      message = `📋 *ОБНОВЛЕНИЕ ЗАКАЗА #${orderData.id}*

👤 *Клиент:* ${orderData.customer}
📞 *Телефон:* ${orderData.phone}

🔄 *Новый статус:* ${getStatusText(orderData.status)}
⏰ *Время обновления:* ${new Date().toLocaleString('ru-RU')}

🔗 *Перейти в админку:* https://tomyangbar.vercel.app/admin`;
    }

    // Отправляем сообщение через наш API endpoint
    try {
      const sendResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/telegram/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          type: type
        })
      });

      if (!sendResponse.ok) {
        const errorData = await sendResponse.json();
        console.error('Failed to send message:', errorData);
        
        return res.status(500).json({
          error: 'Failed to send Telegram notification',
          details: errorData.details || 'Unknown error'
        });
      }

      const telegramResult = await sendResponse.json();
      console.log('Telegram notification sent:', telegramResult);

      return res.status(200).json({
        success: true,
        message: 'Notification sent successfully',
        telegramMessageId: telegramResult.result?.message_id
      });
    } catch (sendError) {
      console.error('Error sending message:', sendError);
      
      return res.status(500).json({
        error: 'Failed to send Telegram notification',
        details: sendError.message
      });
    }

  } catch (error) {
    console.error('Telegram notification error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Функция для получения текста статуса
function getStatusText(status) {
  switch (status) {
    case 'pending': return '⏳ Ожидает';
    case 'preparing': return '👨‍🍳 Готовится';
    case 'delivering': return '🚚 Доставляется';
    case 'completed': return '✅ Завершен';
    case 'cancelled': return '❌ Отменен';
    default: return '❓ Неизвестно';
  }
}
