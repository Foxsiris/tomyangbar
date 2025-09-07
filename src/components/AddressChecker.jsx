import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CheckCircle, XCircle, MapPin } from 'lucide-react';
import AddressAutocomplete from './AddressAutocomplete';

const AddressChecker = ({ address, onZoneFound, onZoneNotFound }) => {
  const [addressResult, setAddressResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Зоны доставки (обновленные координаты для Саратова)
  const deliveryZones = useMemo(() => [
    {
      name: 'Центральная зона',
      color: '#4CAF50',
      coordinates: [
        [51.545, 45.995], [51.545, 46.025], [51.530, 46.025], 
        [51.530, 45.995], [51.545, 45.995]
      ],
      minOrder: 1000,
      deliveryTime: '45-60 мин'
    },
    {
      name: 'Расширенная зона',
      color: '#2196F3', 
      coordinates: [
        // Внешний контур (больший прямоугольник)
        [51.550, 45.970], [51.550, 46.040], [51.540, 46.045], 
        [51.530, 46.045], [51.525, 46.040], [51.525, 46.020], 
        [51.520, 46.020], [51.520, 45.970],
        // Внутренний контур (вырезаем центральную зону)
        [51.530, 45.995], [51.530, 46.025], [51.545, 46.025], 
        [51.545, 45.995], [51.530, 45.995]
      ],
      minOrder: 1500,
      deliveryTime: '60-90 мин'
    },
    {
      name: 'Дальняя зона',
      color: '#FF9800',
      coordinates: [
        // Внешний контур (расширенный для покрытия ул. Орджоникидзе)
        [51.560, 45.920], [51.560, 46.080], [51.550, 46.085], 
        [51.540, 46.090], [51.530, 46.090], [51.520, 46.085], 
        [51.510, 46.080], [51.500, 46.070], [51.490, 46.060], 
        [51.485, 46.050], [51.480, 46.040], [51.475, 46.030], 
        [51.470, 46.020], [51.465, 46.010], [51.460, 46.000], 
        [51.455, 45.990], [51.450, 45.980], [51.445, 45.970], 
        [51.440, 45.960], [51.435, 45.950], [51.430, 45.940], 
        [51.425, 45.930], [51.420, 45.920],
        // Внутренний контур (вырезаем расширенную зону)
        [51.520, 45.970], [51.520, 46.020], [51.525, 46.020], 
        [51.525, 46.040], [51.530, 46.045], [51.540, 46.045], 
        [51.550, 46.040], [51.550, 45.970]
      ],
      minOrder: 2000,
      deliveryTime: '90-120 мин'
    }
  ], []);

  // Классический алгоритм ray casting для проверки точки в полигоне
  const isPointInPolygonRayCasting = useCallback((point, polygon) => {
    const [x, y] = point;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }, []);

  // Функция для проверки точки в полигоне с поддержкой "дырок"
  const isPointInPolygonWithHoles = useCallback((point, polygon) => {
    // Разделяем полигон на внешний контур и внутренние контуры (дырки)
    let outerContour, innerContours = [];
    
    // Определяем границы внешнего и внутреннего контуров в зависимости от длины полигона
    if (polygon.length === 5) {
      // Центральная зона - простой полигон без дырок
      outerContour = polygon;
    } else if (polygon.length === 12) {
      // Расширенная зона: первые 8 точек - внешний контур, последние 4 - внутренний
      outerContour = polygon.slice(0, 8);
      innerContours = [polygon.slice(8, 12)];
    } else if (polygon.length === 30) {
      // Дальняя зона: первые 22 точки - внешний контур, последние 8 - внутренний
      outerContour = polygon.slice(0, 22);
      innerContours = [polygon.slice(22, 30)];
    } else {
      // Fallback для других случаев
      outerContour = polygon;
    }
    
    // Проверяем, находится ли точка во внешнем контуре
    const inOuterContour = isPointInPolygonRayCasting(point, outerContour);
    
    if (!inOuterContour) {
      return false;
    }
    
    // Проверяем, не находится ли точка в какой-либо "дырке"
    for (const innerContour of innerContours) {
      if (isPointInPolygonRayCasting(point, innerContour)) {
        return false; // Точка в дырке
      }
    }
    
    return true; // Точка в полигоне, но не в дырке
  }, [isPointInPolygonRayCasting]);

  // Функция для проверки, находится ли точка в зоне доставки
  const checkPointInZones = useCallback((coordinates) => {
    const [lat, lon] = coordinates;
    
    // Сначала проверяем центральную зону (самый высокий приоритет)
    const centralZone = deliveryZones[0];
    
    const isInCentral = isPointInPolygonRayCasting([lat, lon], centralZone.coordinates);
    
    if (isInCentral) {
      return centralZone;
    }
    
    // Затем проверяем остальные зоны
    for (let i = 1; i < deliveryZones.length; i++) {
      const zone = deliveryZones[i];
      
      const isInZone = isPointInPolygonWithHoles([lat, lon], zone.coordinates);
      
      if (isInZone) {
        return zone;
      }
    }
    
    return null; // Точка не входит ни в одну зону
  }, [deliveryZones, isPointInPolygonWithHoles, isPointInPolygonRayCasting]);

  const initMap = useCallback(() => {
    if (!mapRef.current) return;
    
    // Проверяем, что карта еще не создана
    if (mapInstanceRef.current) {
      return;
    }

    window.ymaps.ready(() => {
      // Проверяем еще раз, что карта не создана
      if (mapInstanceRef.current) {
        return;
      }
      
      // Очищаем div перед созданием карты
      if (mapRef.current) {
        mapRef.current.innerHTML = '';
      }
      
      // Создаем карту
      const map = new window.ymaps.Map(mapRef.current, {
        center: [51.5406, 46.0086], // Саратов
        zoom: 11,
        controls: ['zoomControl', 'fullscreenControl']
      });

      mapInstanceRef.current = map;

      // Добавляем зоны доставки
      deliveryZones.forEach((zone) => {
        let polygonCoordinates;
        
        // Для зон с "дырками" создаем массив контуров
        if (zone.coordinates.length === 5) {
          // Центральная зона: обычный полигон
          polygonCoordinates = [zone.coordinates];
        } else if (zone.coordinates.length === 12) {
          // Расширенная зона: внешний контур + внутренний контур
          polygonCoordinates = [
            zone.coordinates.slice(0, 8), // внешний контур
            zone.coordinates.slice(8, 12) // внутренний контур (дырка)
          ];
        } else if (zone.coordinates.length === 30) {
          // Дальняя зона: внешний контур + внутренний контур
          polygonCoordinates = [
            zone.coordinates.slice(0, 22), // внешний контур
            zone.coordinates.slice(22, 30) // внутренний контур (дырка)
          ];
        } else {
          polygonCoordinates = [zone.coordinates];
        }
        
        const polygon = new window.ymaps.Polygon(
          polygonCoordinates,
          {
            hintContent: zone.name,
            balloonContent: `
              <div>
                <h3>${zone.name}</h3>
                <p>Минимальный заказ: ${zone.minOrder}₽</p>
                <p>Время доставки: ${zone.deliveryTime}</p>
              </div>
            `
          },
          {
            fillColor: zone.color,
            fillOpacity: 0.3,
            strokeColor: zone.color,
            strokeWidth: 3,
            strokeOpacity: 0.8
          }
        );

        map.geoObjects.add(polygon);
      });

      // Добавляем маркер ресторана
      const restaurantPlacemark = new window.ymaps.Placemark(
        [51.5406, 46.0086], // ул. Чапаева, 89
        {
          hintContent: 'Tom Yang Bar',
          balloonContent: `
            <div>
              <h3>Tom Yang Bar</h3>
              <p>ул. Чапаева, 89</p>
              <p>Саратов</p>
              <p>+7 (927) 112-65-00</p>
            </div>
          `,
          type: 'restaurant'
        },
        {
          preset: 'islands#redDotIcon',
          iconColor: '#dc2626'
        }
      );

      map.geoObjects.add(restaurantPlacemark);
      setIsMapLoaded(true);
    });
  }, [deliveryZones]);

  const checkAddress = useCallback(async () => {
    if (!address.trim()) {
      setAddressResult({ success: false, message: 'Введите адрес' });
      return;
    }

    setIsChecking(true);
    
    // Сначала пробуем реальный геокодер
    if (window.ymaps) {
      const searchQuery = address.includes('Саратов') ? address : `${address}, Саратов`;
      
      try {
        const res = await window.ymaps.geocode(searchQuery);
        
        const firstGeoObject = res.geoObjects.get(0);
        
        if (firstGeoObject) {
          const coordinates = firstGeoObject.geometry.getCoordinates();
          
          // Проверяем, в какой зоне находится адрес
          const foundZone = checkPointInZones(coordinates);
          
          if (foundZone) {
            setAddressResult({
              success: true,
              zone: foundZone,
              message: `Адрес входит в ${foundZone.name.toLowerCase()}`,
              minOrder: foundZone.minOrder,
              deliveryTime: foundZone.deliveryTime,
              coordinates: coordinates
            });
            onZoneFound && onZoneFound(foundZone);
          } else {
            setAddressResult({ 
              success: false, 
              message: `Адрес не входит в зону доставки`,
              coordinates: coordinates
            });
            onZoneNotFound && onZoneNotFound();
          }

          // Перемещаем карту к найденному адресу с приближением
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(coordinates, 16);
          }
          
          // Очищаем старые маркеры адресов (оставляем только ресторан)
          if (mapInstanceRef.current) {
            const geoObjects = mapInstanceRef.current.geoObjects;
            geoObjects.each((geoObject) => {
              if (geoObject.properties && geoObject.properties.get('type') === 'address') {
                geoObjects.remove(geoObject);
              }
            });
          }
          
          // Добавляем маркер адреса
          const addressPlacemark = new window.ymaps.Placemark(
            coordinates,
            {
              hintContent: address,
              balloonContent: foundZone ? `
                <div>
                  <h3>${address}</h3>
                  <p>${foundZone.name}</p>
                  <p>Минимальный заказ: ${foundZone.minOrder}₽</p>
                  <p>Время доставки: ${foundZone.deliveryTime}</p>
                </div>
              ` : `
                <div>
                  <h3>${address}</h3>
                  <p style="color: red;">Адрес не входит в зону доставки</p>
                </div>
              `,
              type: 'address'
            },
            {
              preset: foundZone ? 'islands#blueDotIcon' : 'islands#redDotIcon',
              iconColor: foundZone ? '#3b82f6' : '#dc2626'
            }
          );

          mapInstanceRef.current.geoObjects.add(addressPlacemark);
          setIsChecking(false);
          return;
        }
      } catch {
        // Переключаемся на fallback режим
      }
    }
    
    // Если Яндекс API не работает, показываем ошибку
    setAddressResult({ 
      success: false, 
      message: 'Не удалось найти адрес. Проверьте подключение к интернету или попробуйте позже.'
    });
    onZoneNotFound && onZoneNotFound();
    setIsChecking(false);
  }, [address, onZoneFound, onZoneNotFound, checkPointInZones]);

  // Инициализация карты
  useEffect(() => {
    // Проверяем, загружена ли Яндекс.Карты API
    if (window.ymaps) {
      initMap();
    } else {
      // Ждем загрузки API
      const checkYmaps = setInterval(() => {
        if (window.ymaps) {
          clearInterval(checkYmaps);
          initMap();
        }
      }, 100);
      
      // Таймаут на случай, если API не загрузится
      setTimeout(() => {
        if (!window.ymaps) {
          clearInterval(checkYmaps);
        }
      }, 10000);
    }
    
    // Очистка при размонтировании компонента
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [initMap]);

  // Автоматически проверяем адрес при изменении
  useEffect(() => {
    if (address.trim()) {
      const timeoutId = setTimeout(() => {
        checkAddress();
      }, 1000); // Задержка 1 секунда после ввода
      
      return () => clearTimeout(timeoutId);
    } else {
      setAddressResult(null);
    }
  }, [address, checkAddress]);

  return (
    <div className="mt-3">
      {isChecking && (
        <div className="flex items-center text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
          Проверяем адрес...
        </div>
      )}
      
      {addressResult && !isChecking && (
        <div className={`p-3 rounded-lg ${
          addressResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            {addressResult.success ? (
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600 mr-2" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                addressResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {addressResult.message}
              </p>
              {addressResult.success && addressResult.zone && (
                <div className="mt-1 text-xs text-green-700">
                  <p>Минимальный заказ: {addressResult.minOrder}₽</p>
                  <p>Время доставки: {addressResult.deliveryTime}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Карта */}
      <div className="mt-4 relative">
        <div 
          ref={mapRef} 
          className="w-full h-64 rounded-lg"
          style={{ minHeight: '256px' }}
        />
        
        {!isMapLoaded && (
          <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Загрузка карты...</p>
            </div>
          </div>
        )}
        
        {/* Легенда зон */}
        <div className="absolute top-2 right-2 bg-white p-2 rounded-lg shadow-lg">
          <h4 className="font-semibold text-gray-900 mb-1 text-xs">Зоны доставки</h4>
          <div className="space-y-1">
            {deliveryZones.map((zone, index) => (
              <div key={index} className="flex items-center text-xs">
                <div 
                  className="w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: zone.color }}
                ></div>
                <span className="text-gray-700">{zone.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressChecker;
