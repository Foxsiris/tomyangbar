import { motion } from 'framer-motion';

const StatsCard = ({ number, label, description, icon: Icon, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      {Icon && (
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-lg mb-4">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
        {number}
      </div>
      <div className="text-lg font-semibold text-gray-900 mb-1">
        {label}
      </div>
      {description && (
        <div className="text-sm text-gray-600">
          {description}
        </div>
      )}
    </motion.div>
  );
};

export default StatsCard;
