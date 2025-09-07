// API ключ Яндекс.Карт
const YANDEX_API_KEY = process.env.YANDEX_MAPS_API_KEY || 'YOUR_YANDEX_MAPS_API_KEY';

// Endpoint для геокодирования адреса
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
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: 'Адрес не указан' });
    }

    // Формируем URL для запроса к Yandex Geocoder API
    const yandexUrl = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${encodeURIComponent(address)}&format=json&results=1`;

    const response = await fetch(yandexUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; RestaurantApp/1.0)'
      }
    });

    if (!response.ok) {
      console.error('Yandex Geocoder API error:', response.status, response.statusText);
      return res.status(response.status).json({ 
        error: 'Ошибка при запросе к Yandex Geocoder API',
        status: response.status 
      });
    }

    const data = await response.json();
    
    // Извлекаем координаты из ответа
    const geoObjects = data.response?.GeoObjectCollection?.featureMember || [];
    
    if (geoObjects.length === 0) {
      return res.json({ 
        coordinates: null,
        address: address,
        found: false 
      });
    }

    const geoObject = geoObjects[0].GeoObject;
    const coordinates = geoObject.Point.pos.split(' ').map(Number);
    
    res.json({
      coordinates: {
        longitude: coordinates[0],
        latitude: coordinates[1]
      },
      address: geoObject.metaDataProperty.GeocoderMetaData.text,
      found: true
    });

  } catch (error) {
    console.error('Error in yandex geocode endpoint:', error);
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера',
      message: error.message 
    });
  }
}
