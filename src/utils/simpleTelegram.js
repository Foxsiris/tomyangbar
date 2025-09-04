// Простая отправка уведомлений в Telegram без бота
// Использует внешние сервисы для отправки сообщений

/**
 * Отправляет уведомление через IFTTT (If This Then That)
 * Это самый простой способ отправить сообщение в Telegram без создания бота
 */
export const sendViaIFTTT = async (message) => {
  try {
    // Замените YOUR_IFTTT_WEBHOOK_URL на ваш URL от IFTTT
    const IFTTT_WEBHOOK_URL = 'https://maker.ifttt.com/trigger/telegram_notification/with/key/YOUR_IFTTT_KEY';
    
    const response = await fetch(IFTTT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value1: message, // Сообщение
        value2: '594704789', // Ваш Chat ID
        value3: 'Tom Yang Bar' // Источник
      })
    });

    return response.ok;
  } catch (error) {
    console.error('❌ Ошибка IFTTT:', error);
    return false;
  }
};

/**
 * Отправляет уведомление через простой webhook
 * Можно использовать любой сервис, который принимает POST запросы
 */
export const sendViaWebhook = async (message) => {
  try {
    // Замените на ваш webhook URL
    const WEBHOOK_URL = 'https://your-webhook-service.com/send-telegram';
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: '594704789',
        message: message,
        source: 'Tom Yang Bar'
      })
    });

    return response.ok;
  } catch (error) {
    console.error('❌ Ошибка webhook:', error);
    return false;
  }
};

/**
 * Отправляет уведомление через серверный API (безопасно)
 */
export const sendViaBotAPI = async (message, type = 'notification') => {
  try {
    // Отправляем через наш серверный API endpoint
    const response = await fetch('/api/telegram-send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        type: type
      })
    });

    if (response.ok) {
      const result = await response.json();
      return result.success;
    } else {
      const errorData = await response.json();
      console.error('❌ Ошибка отправки:', errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Ошибка отправки:', error);
    return false;
  }
};

/**
 * Универсальная функция отправки уведомления
 * Пробует разные способы отправки
 */
export const sendTelegramNotification = async (message, method = 'bot', type = 'notification') => {
  switch (method) {
    case 'ifttt':
      return await sendViaIFTTT(message);
    case 'webhook':
      return await sendViaWebhook(message);
    case 'bot':
    default:
      return await sendViaBotAPI(message, type);
  }
};

// Функции доступны только для внутреннего использования
