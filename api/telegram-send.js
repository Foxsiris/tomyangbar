// API endpoint для отправки уведомлений в Telegram
export default async function handler(req, res) {
  console.log('📡 API endpoint /api/telegram-send вызван');
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  
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
    const { message, type = 'notification' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Конфигурация Telegram
    const TELEGRAM_CONFIG = {
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      chatId: process.env.TELEGRAM_CHAT_ID,
      isTestMode: process.env.NODE_ENV !== 'production'
    };
    
    console.log('🔧 Конфигурация Telegram:');
    console.log('Bot Token:', TELEGRAM_CONFIG.botToken ? 'Настроен' : 'Не настроен');
    console.log('Chat ID:', TELEGRAM_CONFIG.chatId);
    console.log('Test Mode:', TELEGRAM_CONFIG.isTestMode);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('Все переменные окружения:', Object.keys(process.env).filter(key => key.includes('TELEGRAM')));
    
    // Проверяем наличие обязательных переменных
    if (!TELEGRAM_CONFIG.botToken) {
      return res.status(500).json({
        error: 'TELEGRAM_BOT_TOKEN not configured',
        details: 'Bot token is missing from environment variables'
      });
    }
    
    if (!TELEGRAM_CONFIG.chatId) {
      return res.status(500).json({
        error: 'TELEGRAM_CHAT_ID not configured',
        details: 'Chat ID is missing from environment variables'
      });
    }

    // В тестовом режиме логируем
    if (TELEGRAM_CONFIG.isTestMode) {
      console.log('📱 TELEGRAM NOTIFICATION (TEST MODE):');
      console.log('Chat ID:', TELEGRAM_CONFIG.chatId);
      console.log('Type:', type);
      console.log('Message:', message);
      
      return res.status(200).json({
        success: true,
        message: 'Notification logged (test mode)',
        testMode: true,
        chatId: TELEGRAM_CONFIG.chatId
      });
    }

    // Отправляем сообщение через Telegram Bot API
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;
    const telegramPayload = {
      chat_id: TELEGRAM_CONFIG.chatId,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    };
    
    console.log('📤 Отправляем запрос в Telegram API:');
    console.log('URL:', telegramUrl);
    console.log('Payload:', telegramPayload);
    
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(telegramPayload)
    });

    console.log('📥 Ответ от Telegram API:');
    console.log('Status:', telegramResponse.status);
    console.log('Status Text:', telegramResponse.statusText);

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.json();
      console.error('Telegram API Error:', errorData);
      
      return res.status(500).json({
        error: 'Failed to send Telegram message',
        details: errorData.description || 'Unknown error',
        chatId: TELEGRAM_CONFIG.chatId,
        telegramError: errorData
      });
    }

    const telegramResult = await telegramResponse.json();
    console.log('Telegram message sent successfully');

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      telegramMessageId: telegramResult.result?.message_id,
      chatId: TELEGRAM_CONFIG.chatId
    });

  } catch (error) {
    console.error('Telegram send error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
