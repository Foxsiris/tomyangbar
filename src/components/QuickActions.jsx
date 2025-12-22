import { motion } from 'framer-motion';
import { Phone, MapPin, Clock, Truck } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      icon: <Phone className="w-5 h-5" />,
      title: 'Заказать по телефону',
      description: '+7 (927) 112-65-00',
      action: () => window.open('tel:+79271126500'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: 'Найти нас',
      description: 'г. Саратов, ул. Чапаева, д. 89',
      action: () => window.open('https://maps.google.com'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: 'Часы работы',
      description: 'Пн-Вс: 11:00 - 23:00',
      action: () => {},
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      icon: <Truck className="w-5 h-5" />,
      title: 'Доставка',
      description: 'От 45 минут',
      action: () => {},
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          onClick={action.action}
          className={`${action.color} text-white rounded-lg p-4 text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
        >
          <div className="flex justify-center mb-2">
            {action.icon}
          </div>
          <h3 className="font-semibold text-sm mb-1">
            {action.title}
          </h3>
          <p className="text-xs opacity-90">
            {action.description}
          </p>
        </motion.button>
      ))}
    </div>
  );
};

export default QuickActions;
