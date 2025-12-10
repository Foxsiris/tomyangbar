import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Flame, Leaf } from 'lucide-react';
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

  if (!dish) return null;

  const handleAddToCart = () => {
    addToCart(dish);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl w-full max-w-xl"
              onClick={(e) => e.stopPropagation()}
            >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-gray-800/80 hover:bg-gray-800 rounded-full p-2 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Image */}
          <div className="relative aspect-[4/3] bg-gray-200">
            <img
              src={dish.image || dish.image_url || '/vite.svg'}
              alt={dish.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/vite.svg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute top-4 left-4 flex gap-2">
              {dish.is_popular && (
                <div className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  Популярное
                </div>
              )}
              {dish.is_spicy && (
                <div className="bg-orange-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                  <Flame className="w-3 h-3 mr-1" />
                  Острое
                </div>
              )}
              {dish.is_vegetarian && (
                <div className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                  <Leaf className="w-3 h-3 mr-1" />
                  Вегетарианское
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Title and Price */}
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{dish.name}</h2>
              <div className="text-2xl font-bold text-primary-600">{dish.price} ₽</div>
            </div>

            {/* Description */}
            {dish.description && (
              <p className="text-gray-600 mb-4">{dish.description}</p>
            )}

            {/* КБЖУ на 100г */}
            {(dish.calories || dish.proteins || dish.fats || dish.carbs) && (
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">На 100 г:</h3>
                <div className="grid grid-cols-4 gap-4">
                  {dish.calories && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{dish.calories}</div>
                      <div className="text-xs text-gray-500">ккал</div>
                    </div>
                  )}
                  {dish.proteins && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{dish.proteins}г</div>
                      <div className="text-xs text-gray-500">белки</div>
                    </div>
                  )}
                  {dish.fats && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-600">{dish.fats}г</div>
                      <div className="text-xs text-gray-500">жиры</div>
                    </div>
                  )}
                  {dish.carbs && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{dish.carbs}г</div>
                      <div className="text-xs text-gray-500">углеводы</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Weight and Add to Cart */}
            <div className="flex justify-between items-center">
              {dish.weight && (
                <span className="text-sm text-gray-500">{dish.weight}</span>
              )}
              <button
                onClick={handleAddToCart}
                className="btn-primary px-6 py-3"
              >
                В корзину
              </button>
            </div>
            </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DishDetailModal;

