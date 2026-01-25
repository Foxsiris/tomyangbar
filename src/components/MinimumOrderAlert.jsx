import { motion } from 'framer-motion';
import { AlertCircle, ShoppingBag } from 'lucide-react';

const MinimumOrderAlert = ({ currentTotal, minimumOrder = 2 }) => {
  const remaining = minimumOrder - currentTotal;
  const progress = Math.min((currentTotal / minimumOrder) * 100, 100);

  if (currentTotal >= minimumOrder) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border border-green-200 rounded-lg p-4"
      >
        <div className="flex items-center">
          <ShoppingBag className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800 font-medium">
            🎉 Бесплатная доставка доступна!
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
    >
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-yellow-800 font-medium mb-2">
            До бесплатной доставки осталось {remaining} ₽
          </p>
          <div className="w-full bg-yellow-200 rounded-full h-2 mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="bg-yellow-600 h-2 rounded-full"
            />
          </div>
          <p className="text-yellow-700 text-sm">
            Минимальная сумма заказа: {minimumOrder} ₽
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MinimumOrderAlert;
