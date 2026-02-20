import { motion } from 'framer-motion';
import { Star, Droplet } from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { useUISettings } from '../context/UISettingsContext';
import LazyImage from './LazyImage';

const PopularDishCard = ({ dish, index = 0 }) => {
  const { addToCart } = useCartContext();
  const { settings: uiSettings } = useUISettings();
  const anim = uiSettings.homeBlockAnimations
    ? { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: index * 0.1 }, viewport: { once: true } }
    : { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } };

  return (
    <motion.div
      {...anim}
      className="card overflow-hidden"
    >
      <div className="h-48 bg-gray-200 relative">
        <LazyImage
          src={dish.image || '/vite.svg'}
          alt={dish.name}
          className="w-full h-full"
          fallbackSrc="/vite.svg"
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
                  <div className="font-semibold text-gray-900">{dish.proteins}г</div>
                  <div className="text-gray-500">белки</div>
                </div>
              )}
              {dish.fats && (
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{dish.fats}г</div>
                  <div className="text-gray-500">жиры</div>
                </div>
              )}
              {dish.carbs && (
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{dish.carbs}г</div>
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
