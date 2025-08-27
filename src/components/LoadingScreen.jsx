import { motion } from 'framer-motion';
import { Chopsticks } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-4"
        >
          <Chopsticks className="w-16 h-16 text-primary-600 mx-auto" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tom Yang Bar
        </h2>
        <p className="text-gray-600">
          Загружаем вкусные блюда...
        </p>
        
        <div className="mt-6 flex justify-center">
          <motion.div
            className="w-2 h-2 bg-primary-600 rounded-full mx-1"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-2 h-2 bg-primary-600 rounded-full mx-1"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 bg-primary-600 rounded-full mx-1"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
