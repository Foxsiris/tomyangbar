// API ключ Яндекс.Карт
const YANDEX_API_KEY = process.env.YANDEX_MAPS_API_KEY || 'YOUR_YANDEX_MAPS_API_KEY';

// Endpoint для получения подсказок адресов
export default async function handler(req, res) {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  try {
    const { text, type = 'address', lang = 'ru_RU', results = 10 } = req.query;

    if (!text || text.length < 3) {
      return res.json({ results: [] });
    }

    // Формируем URL для запроса к Yandex API
    const yandexUrl = `https://suggest-maps.yandex.ru/v1/suggest?apikey=${YANDEX_API_KEY}&text=${encodeURIComponent(text)}&type=${type}&lang=${lang}&results=${results}`;

    // Делаем запрос к Yandex API
    const response = await fetch(yandexUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; RestaurantApp/1.0)'
      }
    });

    if (!response.ok) {
      console.error('Yandex API error:', response.status, response.statusText);
      return res.status(response.status).json({ 
        error: 'Ошибка при запросе к Yandex API',
        status: response.status 
      });
    }

    const data = await response.json();
    
    // Фильтруем только адреса в Саратове
    const saratovAddresses = (data.results || []).filter(item => 
      item.subtitle && item.subtitle.toLowerCase().includes('саратов')
    );

    res.json({ 
      results: saratovAddresses,
      originalCount: data.results ? data.results.length : 0,
      filteredCount: saratovAddresses.length
    });

  } catch (error) {
    console.error('Error in yandex suggest endpoint:', error);
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера',
      message: error.message 
    });
  }
}