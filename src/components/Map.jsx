import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';

const Map = () => {
  const handleOpenMap = () => {
    // Открываем Google Maps с координатами ресторана
    const address = encodeURIComponent('г. Москва, ул. Примерная, 123');
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
  };

  return (
    <section className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Как нас найти
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Мы находимся в центре города, легко добраться на любом транспорте
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Карта */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Интерактивная карта будет загружена здесь
                </p>
                <button
                  onClick={handleOpenMap}
                  className="btn-primary inline-flex items-center"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Открыть в Google Maps
                </button>
              </div>
            </div>
          </motion.div>

          {/* Информация о местоположении */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Адрес ресторана
              </h3>
              <p className="text-gray-600 text-lg">
                г. Москва, ул. Примерная, 123
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Как добраться
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">На метро</p>
                    <p className="text-gray-600">Станция "Примерная" (5 минут пешком)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">На автобусе</p>
                    <p className="text-gray-600">Остановка "Примерная улица" (маршруты 123, 456)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">На автомобиле</p>
                    <p className="text-gray-600">Есть парковка для клиентов</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Часы работы
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Понедельник - Пятница</span>
                  <span className="font-medium">11:00 - 23:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Суббота - Воскресенье</span>
                  <span className="font-medium">11:00 - 23:00</span>
                </div>
              </div>
            </div>

            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="font-semibold text-primary-900 mb-2">
                🚚 Бесплатная доставка
              </h4>
              <p className="text-primary-800 text-sm">
                Доставляем в радиусе 5 км от ресторана. Время доставки от 45 минут.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Map;
