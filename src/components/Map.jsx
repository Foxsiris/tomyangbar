import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Mail } from 'lucide-react';
import YandexMap from './YandexMap';

const Map = () => {
  // Зоны доставки для отображения в левой части
  const deliveryZones = [
    {
      name: 'Зелёная зона',
      color: '#56db40',
      minOrder: 1000,
      deliveryTime: '45-60 мин'
    },
    {
      name: 'Синяя зона',
      color: '#1e98ff', 
      minOrder: 1700,
      deliveryTime: '60-90 мин'
    },
    {
      name: 'Оранжевая зона',
      color: '#ff931e',
      minOrder: 2000,
      deliveryTime: '90-120 мин'
    },
    {
      name: 'Красная зона',
      color: '#ed4543',
      minOrder: 3000,
      deliveryTime: '120+ мин'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Как нас найти
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Приходите к нам в гости и насладитесь лучшими блюдами азиатской кухни. 
            Или закажите доставку - мы работаем по всему Саратову!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Контактная информация */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <MapPin className="w-6 h-6 text-primary-600 mr-3" />
              Адрес ресторана
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <MapPin className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Tom Yang Bar</h4>
                  <p className="text-gray-600">ул. Чапаева, 89</p>
                  <p className="text-gray-600">Саратов, Саратовская обл.</p>
                  <p className="text-gray-600">Россия, 410012</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Телефон</h4>
                  <p className="text-gray-600">+7 (927) 112-65-00</p>
                  <p className="text-sm text-gray-500">Для заказов и бронирования</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Clock className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Часы работы</h4>
                  <div className="space-y-1 text-gray-600">
                    <p>Понедельник - Пятница: 11:00 - 23:00</p>
                    <p>Суббота - Воскресенье: 11:00 - 23:00</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Mail className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Email</h4>
                  <p className="text-gray-600">info@tomyangbar.ru</p>
                  <p className="text-sm text-gray-500">Для вопросов и предложений</p>
                </div>
              </div>
            </div>

          </motion.div>

          {/* Интерактивная карта с зонами доставки */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <YandexMap />
          </motion.div>

        </div>

        {/* Дополнительная информация */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl mb-3">🚗</div>
            <h4 className="font-semibold text-gray-900 mb-2">Парковка</h4>
            <p className="text-gray-600">Бесплатная парковка для гостей ресторана</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl mb-3">🚌</div>
            <h4 className="font-semibold text-gray-900 mb-2">Общественный транспорт</h4>
            <p className="text-gray-600">Остановки автобусов и троллейбусов рядом</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl mb-3">🚚</div>
            <h4 className="font-semibold text-gray-900 mb-2">Доставка</h4>
            <p className="text-gray-600">Доставляем по всему Саратову от 45 минут</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl mb-3">♿</div>
            <h4 className="font-semibold text-gray-900 mb-2">Доступность</h4>
            <p className="text-gray-600">Полностью доступно для маломобильных гостей</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Map;
