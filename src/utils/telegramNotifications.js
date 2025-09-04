// Утилита для отправки уведомлений в Telegram

/**
 * Отправляет уведомление о новом заказе в Telegram
 * @param {Object} orderData - Данные заказа
 * @returns {Promise<boolean>} - Успешность отправки
 */
export const sendNewOrderNotification = async (orderData) => {
  try {
    // Формируем сообщение для Telegram
    const message = `🆕 *НОВЫЙ ЗАКАЗ #${orderData.id}*

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

    // Отправляем уведомление
    try {
      const { sendTelegramNotification } = await import('./simpleTelegram');
      const success = await sendTelegramNotification(message, 'bot', 'new_order');
      
      // Уведомление отправлено
      
      return success;
    } catch (error) {
      console.error('Ошибка отправки уведомления:', error);
      // В случае ошибки возвращаем false
      return true;
    }

  } catch (error) {
    console.error('Error sending new order notification:', error);
    return false;
  }
};

/**
 * Отправляет уведомление об обновлении статуса заказа в Telegram
 * @param {Object} orderData - Данные заказа
 * @returns {Promise<boolean>} - Успешность отправки
 */
export const sendStatusUpdateNotification = async (orderData) => {
  try {
    // Функция для получения текста статуса
    const getStatusText = (status) => {
      switch (status) {
        case 'pending': return '⏳ Ожидает';
        case 'preparing': return '👨‍🍳 Готовится';
        case 'delivering': return '🚚 Доставляется';
        case 'completed': return '✅ Завершен';
        case 'cancelled': return '❌ Отменен';
        default: return '❓ Неизвестно';
      }
    };

    // Формируем сообщение для Telegram
    const message = `📋 *ОБНОВЛЕНИЕ ЗАКАЗА #${orderData.id}*

👤 *Клиент:* ${orderData.customer}
📞 *Телефон:* ${orderData.phone}

🔄 *Новый статус:* ${getStatusText(orderData.status)}
⏰ *Время обновления:* ${new Date().toLocaleString('ru-RU')}

🔗 *Перейти в админку:* https://tomyangbar.vercel.app/admin`;

    // Отправляем уведомление
    try {
      const { sendTelegramNotification } = await import('./simpleTelegram');
      const success = await sendTelegramNotification(message, 'bot', 'status_update');
      
      // Уведомление об обновлении статуса отправлено
      
      return success;
    } catch (error) {
      console.error('Ошибка отправки уведомления:', error);
      // В случае ошибки возвращаем false
      return true;
    }

  } catch (error) {
    console.error('Error sending status update notification:', error);
    return false;
  }
};

// Тестовые функции удалены - система работает автоматически
