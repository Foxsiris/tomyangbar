// API endpoint для отправки сообщений в Telegram через Bot API
// Этот endpoint использует бота для отправки сообщений на ваш Chat ID

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
    const { message, type = 'notification' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Конфигурация Telegram
    const TELEGRAM_CONFIG = {
      // ВАЖНО: Замените на токен вашего бота
      botToken: process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE',
      // Ваш личный Chat ID
      chatId: process.env.TELEGRAM_CHAT_ID || '594704789',
      isTestMode: process.env.NODE_ENV !== 'production'
    };

    // В тестовом режиме просто логируем
    if (TELEGRAM_CONFIG.isTestMode) {
      console.log('📱 TELEGRAM MESSAGE (TEST MODE):');
      console.log('Chat ID:', TELEGRAM_CONFIG.chatId);
      console.log('Type:', type);
      console.log('Message:', message);
      
      return res.status(200).json({
        success: true,
        message: 'Message logged (test mode)',
        testMode: true,
        chatId: TELEGRAM_CONFIG.chatId
      });
    }

    // Отправляем сообщение через Telegram Bot API
    const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CONFIG.chatId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    });

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.json();
      console.error('Telegram API Error:', errorData);
      
      return res.status(500).json({
        error: 'Failed to send Telegram message',
        details: errorData.description || 'Unknown error',
        chatId: TELEGRAM_CONFIG.chatId
      });
    }

    const telegramResult = await telegramResponse.json();
    console.log('Telegram message sent:', telegramResult);

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      telegramMessageId: telegramResult.result?.message_id,
      chatId: TELEGRAM_CONFIG.chatId
    });

  } catch (error) {
    console.error('Telegram message error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
