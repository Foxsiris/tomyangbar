import { motion } from 'framer-motion';
import { Star, Flame, Leaf } from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { menuData } from '../data/menuData';

const DishCard = ({ dish, index = 0 }) => {
  const { addToCart } = useCartContext();

  const getCategoryName = (categoryId) => {
    const category = menuData.categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      className="card overflow-hidden group"
    >
      <div className="h-48 bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute top-3 left-3 flex gap-2">
          {dish.popular && (
            <div className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <Star className="w-3 h-3 mr-1" />
              Популярное
            </div>
          )}
          {dish.spicy && (
            <div className="bg-orange-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <Flame className="w-3 h-3 mr-1" />
              Острое
            </div>
          )}
          {dish.vegetarian && (
            <div className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <Leaf className="w-3 h-3 mr-1" />
              Вегетарианское
            </div>
          )}
        </div>
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-gray-700">
          {dish.weight}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {dish.name}
          </h3>
          <span className="text-lg font-bold text-primary-600">
            {dish.price} ₽
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {dish.description}
        </p>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {getCategoryName(dish.category)}
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

export default DishCard;
