import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useCartContext } from '../context/CartContext';

const PopularDishCard = ({ dish, index = 0 }) => {
  const { addToCart } = useCartContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="card overflow-hidden"
    >
      <div className="h-48 bg-gray-200 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        {dish.popular && (
          <div className="absolute top-3 left-3 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <Star className="w-3 h-3 mr-1" />
            Популярное
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {dish.name}
          </h3>
          <span className="text-lg font-bold text-primary-600">
            {dish.price} ₽
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          {dish.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {dish.weight}
          </span>
          <button
            onClick={() => addToCart(dish)}
            className="btn-primary text-sm py-2 px-4"
          >
            В корзину
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PopularDishCard;
