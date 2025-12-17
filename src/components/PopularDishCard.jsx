import { motion } from 'framer-motion';
import { Star, Droplet } from 'lucide-react';
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
        <img
          src={dish.image || 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}
          alt={dish.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          {dish.is_popular && (
            <div className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <Star className="w-3 h-3 mr-1" />
              Популярное
            </div>
          )}
          {dish.is_carbonated !== null && dish.is_carbonated !== undefined && (
            <div className={`${dish.is_carbonated ? 'bg-blue-600' : 'bg-cyan-600'} text-white px-2 py-1 rounded-full text-xs font-medium flex items-center`}>
              <Droplet className="w-3 h-3 mr-1" />
              {dish.is_carbonated ? 'Газированный' : 'Негазированный'}
            </div>
          )}
        </div>
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
        <p className="text-gray-600 text-sm mb-3">
          {dish.description}
        </p>
        
        {/* КБЖУ */}
        {(dish.calories || dish.proteins || dish.fats || dish.carbs) && (
          <div className="mb-3 pb-3 border-b border-gray-200">
            <div className="grid grid-cols-4 gap-2 text-xs">
              {dish.calories && (
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{dish.calories}</div>
                  <div className="text-gray-500">ккал</div>
                </div>
              )}
              {dish.proteins && (
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{dish.proteins}г</div>
                  <div className="text-gray-500">белки</div>
                </div>
              )}
              {dish.fats && (
                <div className="text-center">
                  <div className="font-semibold text-yellow-600">{dish.fats}г</div>
                  <div className="text-gray-500">жиры</div>
                </div>
              )}
              {dish.carbs && (
                <div className="text-center">
                  <div className="font-semibold text-green-600">{dish.carbs}г</div>
                  <div className="text-gray-500">углеводы</div>
                </div>
              )}
            </div>
          </div>
        )}
        
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
