// API endpoint для отправки сообщений в Telegram
export default async function handler(req, res) {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  try {
    const { message, type = 'notification' } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Сообщение не может быть пустым' 
      });
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.log('⚠️ Telegram не настроен - пропускаем отправку');
      return res.json({ 
        success: true, 
        message: 'Telegram не настроен, сообщение пропущено' 
      });
    }

    const telegramMessage = `🍜 Tom Yang Bar\n\n${message}`;

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: telegramMessage,
        parse_mode: 'HTML'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Telegram сообщение отправлено:', result);
      return res.json({ 
        success: true, 
        message: 'Сообщение отправлено в Telegram' 
      });
    } else {
      const error = await response.text();
      console.error('❌ Ошибка отправки в Telegram:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Ошибка отправки в Telegram' 
      });
    }

  } catch (error) {
    console.error('❌ Ошибка в telegram-send API:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Внутренняя ошибка сервера' 
    });
  }
}
