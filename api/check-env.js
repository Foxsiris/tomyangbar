// Endpoint для проверки переменных окружения
export default async function handler(req, res) {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  try {
    const yandexApiKey = process.env.YANDEX_MAPS_API_KEY;
    
    res.json({
      environment: process.env.NODE_ENV || 'development',
      yandexApiKeyConfigured: !!yandexApiKey,
      yandexApiKeyLength: yandexApiKey ? yandexApiKey.length : 0,
      yandexApiKeyPreview: yandexApiKey ? `${yandexApiKey.substring(0, 8)}...` : 'NOT_SET',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in check-env:', error);
    res.status(500).json({ 
      error: 'Ошибка проверки переменных окружения',
      message: error.message 
    });
  }
}
