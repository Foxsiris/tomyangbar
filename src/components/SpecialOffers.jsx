import { motion } from 'framer-motion';
import { Star, Clock, Percent } from 'lucide-react';

const SpecialOffers = () => {
  const offers = [
    {
      id: 1,
      title: 'Скидка 20% на первый заказ',
      description: 'При заказе от 1500 рублей',
      icon: <Percent className="w-6 h-6" />,
      color: 'bg-red-500',
      validUntil: '31.12.2024'
    },
    {
      id: 2,
      title: 'Бесплатная доставка',
      description: 'При заказе от 1000 рублей',
      icon: <Star className="w-6 h-6" />,
      color: 'bg-green-500',
      validUntil: 'Постоянно'
    },
    {
      id: 3,
      title: 'Быстрая доставка',
      description: 'Быстрая доставка',
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-blue-500',
      validUntil: 'Постоянно'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {offers.map((offer, index) => (
        <motion.div
          key={offer.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300"
        >
          <div className={`${offer.color} text-white rounded-lg p-3 w-fit mb-4`}>
            {offer.icon}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {offer.title}
          </h3>
          
          <p className="text-gray-600 mb-4">
            {offer.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Действует до: {offer.validUntil}
            </span>
            <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              Подробнее →
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SpecialOffers;
