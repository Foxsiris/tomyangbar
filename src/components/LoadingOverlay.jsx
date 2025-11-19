import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

const LoadingOverlay = ({ 
  isVisible, 
  message = 'Загрузка...',
  className = '' 
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl p-8 text-center"
      >
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 font-medium">
          {message}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default LoadingOverlay;
