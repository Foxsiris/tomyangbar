import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Phone, MapPin, Star } from 'lucide-react';
import RestoPlaceWidget from '../components/RestoPlaceWidget';

const Booking = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Симуляция загрузки виджета
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Заголовок */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Бронирование столиков
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Забронируйте столик в нашем ресторане и насладитесь изысканной японской кухней
        </p>
      </div>

      {/* Информация о ресторане */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-6 h-6 text-red-500 mr-2" />
            Наш ресторан
          </h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-500 mr-3" />
              <span className="text-gray-700">
                <strong>Время работы:</strong> 11:00 - 23:00 (ежедневно)
              </span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 text-gray-500 mr-3" />
              <span className="text-gray-700">
                <strong>Вместимость:</strong> до 50 гостей
              </span>
            </div>
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-500 mr-3" />
              <span className="text-gray-700">
                <strong>Телефон:</strong> +7 (8452) 123-456
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Star className="w-6 h-6 text-yellow-500 mr-2" />
            Особенности
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li>• Романтические столики для двоих</li>
            <li>• Семейные зоны для больших компаний</li>
            <li>• Барная стойка с видом на кухню</li>
            <li>• VIP-зал для особых случаев</li>
            <li>• Детская зона</li>
            <li>• Парковка для гостей</li>
          </ul>
        </div>
      </div>

      {/* Виджет бронирования */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Забронировать столик
        </h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Загружаем систему бронирования...</p>
            </div>
          </div>
        ) : (
          <div>
            {/* Реальный виджет RestoPlace */}
            <RestoPlaceWidget restaurantId="YOUR_RESTAURANT_ID" />
            
            {/* Информация для настройки */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Настройка RestoPlace</h4>
              <p className="text-sm text-blue-700 mb-2">
                Для активации виджета бронирования:
              </p>
              <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                <li>Зарегистрируйтесь на <a href="https://restoplace.ru" target="_blank" rel="noopener noreferrer" className="underline">RestoPlace.ru</a></li>
                <li>Создайте профиль ресторана</li>
                <li>Настройте столики и временные слоты</li>
                <li>Получите ID ресторана</li>
                <li>Замените "YOUR_RESTAURANT_ID" в коде на ваш реальный ID</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Правила бронирования */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Правила бронирования</h3>
        <div className="grid md:grid-cols-2 gap-6 text-gray-700">
          <div>
            <h4 className="font-semibold mb-2">Общие правила:</h4>
            <ul className="space-y-1 text-sm">
              <li>• Бронирование доступно на 30 дней вперед</li>
              <li>• Минимальное время бронирования - 2 часа</li>
              <li>• Подтверждение бронирования по телефону</li>
              <li>• Отмена возможна за 2 часа до визита</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Особые случаи:</h4>
            <ul className="space-y-1 text-sm">
              <li>• VIP-зал - предоплата 50%</li>
              <li>• Группы от 8 человек - меню по договоренности</li>
              <li>• Детские праздники - специальное меню</li>
              <li>• Корпоративные мероприятия - отдельный расчет</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Альтернативные способы бронирования */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Другие способы бронирования</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <a 
            href="tel:+78452123456" 
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center"
          >
            <Phone className="w-5 h-5 mr-2" />
            Позвонить
          </a>
          <a 
            href="https://wa.me/78452123456" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center"
          >
            <Phone className="w-5 h-5 mr-2" />
            WhatsApp
          </a>
          <a 
            href="mailto:booking@tomyangbar.ru" 
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Email
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default Booking;