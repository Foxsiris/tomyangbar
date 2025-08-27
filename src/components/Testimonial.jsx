import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const Testimonial = ({ testimonial, index = 0 }) => {
  const { name, rating, text, date } = testimonial;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center mb-4">
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="ml-2 text-sm text-gray-500">
          {rating}/5
        </span>
      </div>
      
      <p className="text-gray-600 mb-4 italic">
        "{text}"
      </p>
      
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-gray-900">
            {name}
          </h4>
          <p className="text-sm text-gray-500">
            {date}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Testimonial;
