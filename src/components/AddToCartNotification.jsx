import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';

const AddToCartNotification = ({ isVisible, onClose, dishName }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.5 
          }}
          className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-2xl p-4 max-w-sm relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-white opacity-20"></div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white opacity-10 rounded-full"></div>
          
          <div className="flex items-start relative z-10">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="flex-shrink-0"
            >
              <CheckCircle className="w-6 h-6" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="ml-3 flex-1"
            >
              <p className="text-sm font-medium text-white">
                Добавлено в корзину
              </p>
              <p className="text-xs text-white opacity-90 mb-1">カートに追加されました</p>
              <p className="text-sm text-white font-medium mt-1">
                {dishName}
              </p>
              <p className="text-xs text-white opacity-75 mt-1">
                Нажмите на корзину в правом углу, чтобы открыть заказ
              </p>
            </motion.div>
            
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              onClick={onClose}
              className="ml-4 flex-shrink-0 text-white hover:text-gray-200 transition-colors transform hover:scale-110"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddToCartNotification;
