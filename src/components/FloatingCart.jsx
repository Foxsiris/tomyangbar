import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { useEffect, useState } from 'react';

const FloatingCart = () => {
  const { totalItems, openCart } = useCartContext();
  const [isPulsing, setIsPulsing] = useState(false);

  // Анимация пульсации при изменении количества товаров
  useEffect(() => {
    if (totalItems > 0) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: isPulsing ? [1, 1.2, 1] : 1, 
            opacity: 1 
          }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ 
            scale: isPulsing ? { duration: 0.6, repeat: 1 } : { duration: 0.2 }
          }}
          onClick={openCart}
          className="fixed bottom-20 right-6 z-40 bg-primary-600 text-white rounded-full p-4 shadow-lg hover:bg-primary-700 transition-colors group"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold"
            >
              {totalItems}
            </motion.span>
          </div>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            <div className="text-center">
              <div>Открыть корзину</div>
              <div className="text-xs opacity-75">カートを開く</div>
            </div>
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default FloatingCart;
