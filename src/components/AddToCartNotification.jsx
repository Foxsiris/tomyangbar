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
          className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="text-2xl">🦆</div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-green-800">
                Добавлено в корзину
              </p>
              <p className="text-xs text-green-600 mb-1">カートに追加されました</p>
              <p className="text-sm text-green-700 mt-1">
                {dishName}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Нажмите на корзину в правом углу, чтобы открыть заказ
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={onClose}
                className="inline-flex text-green-400 hover:text-green-600 focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddToCartNotification;
