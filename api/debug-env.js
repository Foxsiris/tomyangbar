// Debug endpoint для проверки переменных окружения
export default async function handler(req, res) {
  console.log('🔍 Debug endpoint вызван');
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Проверяем переменные окружения
  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ? 'Настроен' : 'Не настроен',
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID ? 'Настроен' : 'Не настроен',
    allTelegramVars: Object.keys(process.env).filter(key => key.includes('TELEGRAM')),
    totalEnvVars: Object.keys(process.env).length
  };

  console.log('🔧 Переменные окружения:', envCheck);

  return res.status(200).json({
    success: true,
    message: 'Environment variables check',
    data: envCheck,
    timestamp: new Date().toISOString()
  });
}
