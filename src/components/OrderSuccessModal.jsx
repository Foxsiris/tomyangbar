import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ShoppingBag, Clock, Phone } from 'lucide-react';
import { getDisplayOrderNumber } from '../utils/orderUtils';

const OrderSuccessModal = ({ isOpen, orderNumber, onClose }) => {
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

  if (!isOpen) return null;

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
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.5 
          }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-primary-600"></div>
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-primary-100 rounded-full opacity-50"></div>
          <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-primary-50 rounded-full opacity-30"></div>

          {/* Success icon with animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: 0.2, 
              type: "spring", 
              stiffness: 200, 
              damping: 20 
            }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center"
              >
                <ShoppingBag className="w-4 h-4 text-white" />
              </motion.div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Заказ успешно оформлен!
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              注文が正常に完了しました
            </p>

            {/* Order number */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4 mb-6"
            >
              <div className="text-sm text-primary-600 mb-1">Номер заказа</div>
              <div className="text-2xl font-bold text-primary-700">
                {getDisplayOrderNumber({ order_number: orderNumber, id: orderNumber })}
              </div>
            </motion.div>

            {/* Info cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3 mb-6"
            >
              <div className="flex items-center justify-center space-x-3 bg-gray-50 rounded-lg p-3">
                <Clock className="w-5 h-5 text-primary-600" />
                <span className="text-sm text-gray-700">Время доставки зависит от загруженности</span>
              </div>
              <div className="flex items-center justify-center space-x-3 bg-gray-50 rounded-lg p-3">
                <Phone className="w-5 h-5 text-primary-600" />
                <span className="text-sm text-gray-700">Мы свяжемся с вами в ближайшее время</span>
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex space-x-3"
            >
              <button
                onClick={onClose}
                className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-primary-700 transition-colors transform hover:scale-105"
              >
                Отлично!
              </button>
            </motion.div>
          </motion.div>

          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderSuccessModal;
