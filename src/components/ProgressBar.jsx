import { motion } from 'framer-motion';

const ProgressBar = ({ 
  progress, 
  max = 100, 
  height = 'h-2', 
  bgColor = 'bg-gray-200',
  fillColor = 'bg-primary-600',
  showLabel = false,
  label = '',
  className = '' 
}) => {
  const percentage = Math.min((progress / max) * 100, 100);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {label}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div className={`w-full ${height} ${bgColor} rounded-full overflow-hidden`}>
        <motion.div
          className={`h-full ${fillColor} rounded-full`}
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          viewport={{ once: true }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
