import { motion } from 'framer-motion';

const Timeline = ({ items = [] }) => {
  return (
    <div className="relative">
      {/* Линия времени */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
      
      <div className="space-y-8">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="relative flex items-start"
          >
            {/* Точка на линии */}
            <div className="absolute left-2 top-2 w-4 h-4 bg-primary-600 rounded-full border-4 border-white shadow-lg" />
            
            {/* Контент */}
            <div className="ml-12 flex-1">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {item.date}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-3">
                  {item.description}
                </p>
                
                {item.details && (
                  <div className="text-sm text-gray-500">
                    {item.details}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
