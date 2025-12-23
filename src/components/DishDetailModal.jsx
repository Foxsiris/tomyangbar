import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Flame, Leaf, Plus, Droplet } from 'lucide-react';
import { useCartContext } from '../context/CartContext';

const DishDetailModal = ({ dish, isOpen, onClose }) => {
  const { addToCart } = useCartContext();

  // Блокируем скролл body при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!dish || !isOpen) return null;

  const getCategoryName = (categoryId) => {
    if (dish.categories) {
      return dish.categories.name;
    }
    return categoryId;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.5
          }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative h-64 bg-gray-200 overflow-hidden">
            <img
              src={dish.image || '/vite.svg'}
              alt={dish.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/vite.svg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
              {dish.is_popular && (
                <div className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  Популярное
                </div>
              )}
              {dish.is_spicy && (
                <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                  <Flame className="w-3 h-3 mr-1" />
                  Острое
                </div>
              )}
              {dish.is_vegetarian && (
                <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                  <Leaf className="w-3 h-3 mr-1" />
                  Вегетарианское
                </div>
              )}
              {dish.is_carbonated !== null && dish.is_carbonated !== undefined && (
                <div className={`${dish.is_carbonated ? 'bg-blue-600' : 'bg-cyan-600'} text-white px-3 py-1 rounded-full text-xs font-medium flex items-center`}>
                  <Droplet className="w-3 h-3 mr-1" />
                  {dish.is_carbonated ? 'Газированный' : 'Негазированный'}
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Weight */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded text-sm font-medium text-gray-700">
              {dish.weight}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-256px)]">
            {/* Title and Price */}
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {dish.name}
              </h2>
              <span className="text-2xl font-bold text-primary-600">
                {dish.price} ₽
              </span>
            </div>

            {/* Category */}
            <div className="mb-4">
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {getCategoryName(dish.category_id)}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6">
              {dish.description}
            </p>

            {/* КБЖУ */}
            {(dish.calories || dish.proteins || dish.fats || dish.carbs) && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Пищевая ценность</h3>
                <div className="grid grid-cols-4 gap-4">
                  {dish.calories && (
                    <div className="text-center bg-gray-50 rounded-lg p-3">
                      <div className="font-semibold text-gray-900 text-lg">{dish.calories}</div>
                      <div className="text-gray-500 text-sm">ккал</div>
                    </div>
                  )}
                  {dish.proteins && (
                    <div className="text-center bg-gray-50 rounded-lg p-3">
                      <div className="font-semibold text-gray-900 text-lg">{dish.proteins}г</div>
                      <div className="text-gray-500 text-sm">белки</div>
                    </div>
                  )}
                  {dish.fats && (
                    <div className="text-center bg-gray-50 rounded-lg p-3">
                      <div className="font-semibold text-gray-900 text-lg">{dish.fats}г</div>
                      <div className="text-gray-500 text-sm">жиры</div>
                    </div>
                  )}
                  {dish.carbs && (
                    <div className="text-center bg-gray-50 rounded-lg p-3">
                      <div className="font-semibold text-gray-900 text-lg">{dish.carbs}г</div>
                      <div className="text-gray-500 text-sm">углеводы</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={() => {
                addToCart(dish);
                onClose();
              }}
              className="w-full btn-primary py-3 px-6 flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Добавить в корзину</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DishDetailModal;
