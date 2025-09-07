import React, { useEffect, useRef } from 'react';

const RestoPlaceWidget = ({ restaurantId = 'YOUR_RESTAURANT_ID' }) => {
  const widgetRef = useRef(null);

  useEffect(() => {
    // Загрузка скрипта RestoPlace
    const script = document.createElement('script');
    script.src = 'https://restoplace.ru/widget/booking.js';
    script.async = true;
    script.onload = () => {
      // Инициализация виджета после загрузки скрипта
      if (window.RestPlace && widgetRef.current) {
        window.RestPlace.init({
          container: widgetRef.current,
          restaurantId: restaurantId,
          theme: 'light',
          language: 'ru'
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      // Очистка при размонтировании
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [restaurantId]);

  return (
    <div className="restoplace-widget">
      <div ref={widgetRef} className="w-full min-h-[500px]">
        {/* Виджет RestoPlace будет загружен сюда */}
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Загружаем виджет бронирования...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestoPlaceWidget;
