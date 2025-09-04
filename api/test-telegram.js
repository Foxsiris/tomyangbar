// Тестовый endpoint для проверки Telegram API
export default async function handler(req, res) {
  console.log('🧪 Тестовый Telegram endpoint вызван');
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken) {
      return res.status(500).json({
        error: 'TELEGRAM_BOT_TOKEN not configured',
        details: 'Bot token is missing from environment variables'
      });
    }

    if (!chatId) {
      return res.status(500).json({
        error: 'TELEGRAM_CHAT_ID not configured',
        details: 'Chat ID is missing from environment variables'
      });
    }

    // Тестируем получение информации о боте
    console.log('🤖 Тестируем получение информации о боте...');
    const botInfoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const botInfo = await botInfoResponse.json();
    
    console.log('🤖 Информация о боте:', botInfo);

    if (!botInfo.ok) {
      return res.status(500).json({
        error: 'Invalid bot token',
        details: botInfo.description,
        botInfo
      });
    }

    // Тестируем отправку сообщения
    console.log('📤 Тестируем отправку сообщения...');
    const testMessage = `🧪 Тестовое сообщение от бота ${botInfo.result.first_name}\n\nВремя: ${new Date().toLocaleString('ru-RU')}`;
    
    const sendResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: testMessage,
        parse_mode: 'Markdown'
      })
    });

    const sendResult = await sendResponse.json();
    console.log('📥 Результат отправки:', sendResult);

    return res.status(200).json({
      success: true,
      message: 'Telegram test completed',
      botInfo: botInfo.result,
      sendResult,
      chatId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Ошибка тестирования Telegram:', error);
    return res.status(500).json({
      error: 'Telegram test failed',
      details: error.message,
      stack: error.stack
    });
  }
}
