import { motion } from 'framer-motion';
import { Users, Star, Truck } from 'lucide-react';

const RestaurantStats = () => {
  const stats = [
    {
      icon: <Users className="w-8 h-8" />,
      number: '10,000+',
      label: 'Довольных клиентов',
      color: 'text-blue-600'
    },
    {
      icon: <Star className="w-8 h-8" />,
      number: '4.8',
      label: 'Средний рейтинг',
      color: 'text-yellow-600'
    },
    {
      icon: <Truck className="w-8 h-8" />,
      number: '5',
      label: 'Лет опыта',
      color: 'text-red-600'
    }
  ];

  return (
    <section className="section-padding bg-gradient-to-r from-primary-600 to-primary-700">
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
          <p className="text-lg text-primary-100 max-w-2xl mx-auto">
            Цифры, которые говорят о качестве нашего сервиса
          </p>
        </motion.div>

        <div className="flex justify-center items-start gap-40 flex-wrap">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className={`${stat.color} mb-4 flex justify-center`}>
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stat.number}
              </div>
              <div className="text-primary-100 text-sm md:text-base">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RestaurantStats;
