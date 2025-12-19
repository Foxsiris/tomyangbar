// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Truck, Utensils } from 'lucide-react';
import { useMenu } from '../hooks/useMenu';
import PopularDishCard from '../components/PopularDishCard';
import LoadingSpinner from '../components/LoadingSpinner';
import QuickActions from '../components/QuickActions';
import SpecialOffers from '../components/SpecialOffers';
import RestaurantStats from '../components/RestaurantStats';
import DishGallery from '../components/DishGallery';

const Home = () => {
  const { getPopularDishes, isLoading } = useMenu();
  const popularDishes = getPopularDishes().slice(0, 6);

  // Массив изображений для слайдера
  const heroImages = [
    '/main_phone.jpg',
    '/mainPhone2.jpg',
    '/mainPhone3.jpg',
    '/mainPhone5.jpg'
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Автоматическое переключение изображений каждые 10 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); // 5 секунд

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Функция для переключения на конкретное изображение
  const goToSlide = (index) => {
    setCurrentImageIndex(index);
  };

  const features = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Быстрая доставка',
      description: 'Доставка за 45 минут'
    },
    {
      icon: <Utensils className="w-6 h-6" />,
      title: 'Свежие продукты',
      description: 'Готовим только из свежих ингредиентов'
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: 'Бесплатная доставка',
      description: 'При заказе от 1000 рублей'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Images Slider */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <motion.div
              key={index}
              initial={false}
              animate={{
                opacity: index === currentImageIndex ? 1 : 0,
                scale: index === currentImageIndex ? 1 : 1.05
              }}
              transition={{
                duration: 1.5,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${image}')`,
                zIndex: index === currentImageIndex ? 1 : 0
              }}
            >
              {/* Gradient mask with blur effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent" style={{ backdropFilter: 'blur(2px)' }}></div>
            </motion.div>
          ))}
        </div>

        {/* Slider Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Перейти к изображению ${index + 1}`}
            />
          ))}
        </div>
        
        <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <img 
              src="/logo.png" 
              alt="Tom Yang Bar" 
              className="w-20 h-20 mx-auto mb-4 object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🦆</text></svg>';
              }}
            />
            <h1 className="text-5xl md:text-7xl font-bold mb-2 font-serif">
              Tom Yang Bar
            </h1>
            <p className="text-lg text-gray-300 tracking-wider">Саратов</p>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 text-gray-200"
          >
            Ресторан паназиатской кухни со своей атмосферой
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/menu" className="btn-primary inline-flex items-center">
              <div className="flex flex-col items-center">
                <span>Смотреть меню</span>
                <span className="text-xs opacity-75">メニューを見る</span>
              </div>
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <a href="tel:+79271126500" className="btn-secondary inline-flex items-center">
              <div className="flex flex-col items-center">
                <span>Заказать по телефону</span>
                <span className="text-xs opacity-75">電話で注文</span>
              </div>
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
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
              Почему выбирают нас
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Мы предлагаем лучший сервис и качественные блюда азиатской кухни
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-lg mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Dishes Section */}
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
              Популярные блюда
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Попробуйте наши самые любимые блюда гостей
            </p>
          </motion.div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {popularDishes.map((dish, index) => (
               <PopularDishCard key={dish.id} dish={dish} index={index} />
             ))}
           </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/menu" className="btn-primary inline-flex items-center">
              Смотреть все меню
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions Section */}
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
              Быстрые действия
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Свяжитесь с нами любым удобным способом
            </p>
          </motion.div>
          
          <QuickActions />
        </div>
      </section>

      {/* Special Offers Section */}
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
              Специальные предложения
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Выгодные условия для наших клиентов
            </p>
          </motion.div>
          
          <SpecialOffers />
        </div>
      </section>

      {/* Restaurant Stats Section */}
      <RestaurantStats />

      {/* Dish Gallery Section */}
      <DishGallery />

      {/* About Section */}
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
                О нашем ресторане
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Tom Yang Bar — это место, где традиции азиатской кухни встречаются с современным подходом к приготовлению блюд. 
                Мы используем только свежие ингредиенты и готовим каждое блюдо с любовью и вниманием к деталям.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Наше меню включает в себя лучшие блюда японской, китайской и тайской кухни, 
                от классических суши и роллов до экзотических блюд в стиле вок.
              </p>
              <Link to="/about" className="btn-secondary inline-flex items-center">
                Узнать больше
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
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
    </div>
  );
};

export default Home;
