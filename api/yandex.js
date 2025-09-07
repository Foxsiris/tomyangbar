// API ключ Яндекс.Карт
const YANDEX_API_KEY = process.env.YANDEX_MAPS_API_KEY || 'YOUR_YANDEX_MAPS_API_KEY';

// Отладочная информация
console.log('Yandex API Key configured:', YANDEX_API_KEY ? 'YES' : 'NO');
console.log('API Key length:', YANDEX_API_KEY ? YANDEX_API_KEY.length : 0);

// Единый endpoint для всех Yandex API запросов
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
    const { action, ...params } = req.query;

    switch (action) {
      case 'suggest':
        return await handleSuggest(req, res, params);
      case 'geocode':
        return await handleGeocode(req, res, params);
      default:
        return res.status(400).json({ error: 'Неизвестное действие. Используйте: suggest или geocode' });
    }
  } catch (error) {
    console.error('Error in yandex API:', error);
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера',
      message: error.message 
    });
  }
}

// Обработка подсказок адресов
async function handleSuggest(req, res, params) {
  const { text, type = 'address', lang = 'ru_RU', results = 10 } = params;

  if (!text || text.length < 3) {
    return res.json({ results: [] });
  }

  // Проверяем API ключ
  if (!YANDEX_API_KEY || YANDEX_API_KEY === 'YOUR_YANDEX_MAPS_API_KEY') {
    console.error('Yandex API Key not configured');
    return res.status(500).json({ 
      error: 'API ключ Yandex Maps не настроен',
      message: 'Обратитесь к администратору для настройки YANDEX_MAPS_API_KEY'
    });
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
}

// Обработка геокодирования
async function handleGeocode(req, res, params) {
  const { address } = params;

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
}
