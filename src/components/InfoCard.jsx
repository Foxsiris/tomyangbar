import { motion } from 'framer-motion';

const InfoCard = ({ 
  title, 
  description, 
  icon: Icon, 
  variant = 'default',
  index = 0,
  className = '' 
}) => {
  const variants = {
    default: 'bg-white border border-gray-200 hover:border-gray-300',
    primary: 'bg-primary-50 border-primary-200 hover:border-primary-300',
    secondary: 'bg-gray-50 border-gray-200 hover:border-gray-300',
  };

  const iconColors = {
    default: 'bg-primary-600 text-white',
    primary: 'bg-primary-600 text-white',
    secondary: 'bg-gray-600 text-white',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${variants[variant]} ${className}`}
    >
      {Icon && (
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${iconColors[variant]}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600">
        {description}
      </p>
    </motion.div>
  );
};

export default InfoCard;
