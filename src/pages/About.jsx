import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Phone, Mail, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const About = () => {
  // Массив изображений для слайдера (те же что на главной)
  const heroImages = [
    '/main_phone.jpg',
    '/mainPhone2.jpg',
    '/mainPhone3.jpg',
    '/mainPhone5.jpg'
  ];

  // Храним индексы трех видимых фотографий
  const [visibleIndices, setVisibleIndices] = useState([0, 1, 2]);

  // Функции для переключения слайдов (меняем только одну фотографию)
  const goToPrevious = () => {
    setVisibleIndices((prev) => {
      const newIndices = [...prev];
      // Сдвигаем влево: первая фотография уходит, добавляем новую слева
      newIndices[0] = newIndices[1];
      newIndices[1] = newIndices[2];
      newIndices[2] = (newIndices[2] - 1 + heroImages.length) % heroImages.length;
      return newIndices;
    });
  };

  const goToNext = () => {
    setVisibleIndices((prev) => {
      const newIndices = [...prev];
      // Сдвигаем вправо: последняя фотография уходит, добавляем новую справа
      newIndices[2] = newIndices[1];
      newIndices[1] = newIndices[0];
      newIndices[0] = (newIndices[0] + 1) % heroImages.length;
      return newIndices;
    });
  };

  // Получаем 3 видимых изображения
  const getVisibleImages = () => {
    return visibleIndices.map((index) => ({
      src: heroImages[index],
      index
    }));
  };

  const stats = [
    { number: '2+', label: 'Лет опыта' },
    { number: '1000+', label: 'Довольных клиентов' },
    { number: '50+', label: 'Блюд в меню' },
  ];

  const values = [
    {
      title: 'Качество',
      description: 'Мы используем только свежие и качественные ингредиенты для приготовления наших блюд.'
    },
    {
      title: 'Традиции',
      description: 'Соблюдаем традиционные рецепты азиатской кухни, адаптированные под современные вкусы.'
    },
    {
      title: 'Сервис',
      description: 'Обеспечиваем быструю доставку и отличный сервис для каждого гостя.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with 3 Images */}
      <section className="relative h-[600px] overflow-hidden bg-white">
        {/* Three Images Grid with Gaps */}
        <div className="absolute inset-0 flex gap-4 px-4 py-4">
          {getVisibleImages().map((item, idx) => (
            <motion.div
              key={`${item.index}-${idx}`}
              initial={{ opacity: 0, x: idx === 0 ? -30 : idx === 2 ? 30 : 0, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.25, 0.1, 0.25, 1],
                opacity: { duration: 0.6 },
                scale: { duration: 0.8 }
              }}
              className="flex-1 h-full rounded-lg overflow-hidden shadow-xl"
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url('${item.src}')` }}
              />
            </motion.div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-gray-800/80 hover:bg-gray-900/90 rounded-full transition-all duration-300 backdrop-blur-sm shadow-lg"
          aria-label="Предыдущее изображение"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-gray-800/80 hover:bg-gray-900/90 rounded-full transition-all duration-300 backdrop-blur-sm shadow-lg"
          aria-label="Следующее изображение"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>

        {/* Slider Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                // Устанавливаем среднюю фотографию на выбранный индекс
                const middleIndex = visibleIndices[1];
                const diff = index - middleIndex;
                if (diff !== 0) {
                  setVisibleIndices((prev) => {
                    const newIndices = [...prev];
                    newIndices[0] = (index - 1 + heroImages.length) % heroImages.length;
                    newIndices[1] = index;
                    newIndices[2] = (index + 1) % heroImages.length;
                    return newIndices;
                  });
                }
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === visibleIndices[1]
                  ? 'w-8 bg-gray-800'
                  : 'w-2 bg-gray-400 hover:bg-gray-600'
              }`}
              aria-label={`Перейти к слайду ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Text Content */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold mb-4 font-serif text-white"
            >
              О нас
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-white"
            >
              История нашего ресторана
            </motion.p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Наша история
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Tom Yang Bar был основан с целью привнести в город аутентичную азиатскую кухню. 
                Наша команда поваров изучала традиционные рецепты в Японии, Китае и Таиланде, 
                чтобы создать меню, которое сочетает в себе подлинность и современность.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Мы гордимся тем, что используем только свежие, сезонные ингредиенты и готовим 
                каждое блюдо с любовью и вниманием к деталям. Наша миссия — дарить гостям 
                незабываемые гастрономические впечатления.
              </p>
              <p className="text-lg text-gray-600">
                Сегодня Tom Yang Bar — это не просто ресторан, а место, где собираются 
                ценители качественной азиатской кухни, где каждая трапеза превращается в 
                настоящее путешествие по вкусам Востока.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="h-96 bg-gray-200 rounded-lg overflow-hidden">
                <img 
                  src="/main_phone.jpg" 
                  alt="Интерьер ресторана Tom Yang Bar" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/vite.svg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-primary-600">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Наши достижения
            </h2>
            <p className="text-xl text-primary-100">
              Цифры, которыми мы гордимся
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-100">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Наши ценности
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Принципы, которыми мы руководствуемся в нашей работе
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full mb-4">
                  <Star className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
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
              Свяжитесь с нами
            </h2>
            <p className="text-lg text-gray-600">
              Мы всегда рады ответить на ваши вопросы
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center p-6 bg-white rounded-lg shadow-lg"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-lg mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Телефон</h3>
              <p className="text-gray-600">+7 (927) 112-65-00</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center p-6 bg-white rounded-lg shadow-lg"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-lg mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">info@tomyangbar.ru</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center p-6 bg-white rounded-lg shadow-lg"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-lg mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Адрес</h3>
              <p className="text-gray-600">г. Саратов, ул. Чапаева, д. 89</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
