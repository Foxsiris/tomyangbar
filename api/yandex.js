// API ключ Яндекс.Карт
const YANDEX_API_KEY = process.env.YANDEX_MAPS_API_KEY || 'YOUR_YANDEX_MAPS_API_KEY';

// Отладочная информация
console.log('Yandex API Key configured:', YANDEX_API_KEY ? 'YES' : 'NO');
console.log('API Key length:', YANDEX_API_KEY ? YANDEX_API_KEY.length : 0);
console.log('Environment:', process.env.NODE_ENV || 'development');

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
  const { text, results = 10 } = params;

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
  // Попробуем сначала Suggest API, если не работает - используем Geocoder
  const geocoderUrl = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${encodeURIComponent(text)}&format=json&results=${results}`;

  // Пробуем разные варианты поиска для лучших результатов
  const searchVariants = [
    text, // исходный запрос
    text + ' Саратов', // добавляем город
    text.replace(/\s+/g, ''), // убираем пробелы
    text.split(' ')[0] // только первое слово
  ].filter((variant, index, arr) => arr.indexOf(variant) === index); // убираем дубликаты


  let data = { results: [] };

  for (const searchText of searchVariants) {
    const currentSuggestUrl = `https://suggest-maps.yandex.ru/v1/suggest?apikey=${YANDEX_API_KEY}&text=${encodeURIComponent(searchText)}&type=address&lang=ru_RU&results=${results}`;
    
    console.log('Trying Suggest API with:', searchText);
    
    try {
      const response = await fetch(currentSuggestUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; RestaurantApp/1.0)'
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.results && responseData.results.length > 0) {
          console.log('Suggest API success with:', searchText);
          data = responseData;
          break; // Нашли результаты, выходим из цикла
        }
      } else {
        console.warn('Suggest API failed with status:', response.status);
      }
    } catch (error) {
      console.error('Error with search variant:', searchText, error);
    }
  }

  // Если Suggest API не дал результатов, пробуем Geocoder API
  if (data.results.length === 0) {
    console.log('Suggest API failed, trying Geocoder API');
    
    const response = await fetch(geocoderUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; RestaurantApp/1.0)'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Both APIs failed:', response.status, response.statusText, errorText);
      return res.status(response.status).json({ 
        error: 'Ошибка при запросе к Yandex API',
        status: response.status,
        details: errorText
      });
    }

    console.log('Geocoder API success');
    const geocoderData = await response.json();
    
    // Преобразуем данные Geocoder в формат Suggest API
    const geoObjects = geocoderData.response?.GeoObjectCollection?.featureMember || [];
    data = {
      results: geoObjects.map(item => ({
        title: item.GeoObject.name,
        subtitle: item.GeoObject.description || 'Саратов, Саратовская область',
        uri: item.GeoObject.metaDataProperty.GeocoderMetaData.uri
      }))
    };
  }

  
  // Фильтруем адреса - приоритет Саратову, но показываем и другие варианты
  const allAddresses = data.results || [];
  const saratovAddresses = allAddresses.filter(item => 
    item.subtitle && item.subtitle.toLowerCase().includes('саратов')
  );
  
  // Если есть адреса в Саратове - показываем их в первую очередь
  // Если нет - показываем все найденные адреса
  let finalResults = saratovAddresses.length > 0 ? saratovAddresses : allAddresses;
  
  // Дополнительная фильтрация по тексту запроса для более точных результатов
  // Но только если запрос достаточно длинный (больше 3 символов)
  if (text && text.length > 3) {
    const queryLower = text.toLowerCase();
    finalResults = finalResults.filter(item => {
      if (!item.title) return false;
      const titleLower = item.title.toLowerCase();
      
      // Проверяем точное вхождение
      if (titleLower.includes(queryLower)) return true;
      
      // Проверяем по словам (для случаев типа "Плякина" в "улица имени А.В. Плякина")
      const words = titleLower.split(/[\s,.-]+/);
      return words.some(word => word.includes(queryLower));
    });
  }


  res.json({ 
    results: finalResults,
    originalCount: allAddresses.length,
    filteredCount: finalResults.length,
    hasSaratovResults: saratovAddresses.length > 0
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
