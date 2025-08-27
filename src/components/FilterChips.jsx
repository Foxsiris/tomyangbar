import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const FilterChips = ({ 
  filters = [], 
  selectedFilters = [], 
  onFilterChange,
  className = '' 
}) => {
  const toggleFilter = (filter) => {
    if (selectedFilters.includes(filter)) {
      onFilterChange(selectedFilters.filter(f => f !== filter));
    } else {
      onFilterChange([...selectedFilters, filter]);
    }
  };

  const clearAllFilters = () => {
    onFilterChange([]);
  };

  return (
    <div className={`${className}`}>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter, index) => (
          <motion.button
            key={filter.value}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => toggleFilter(filter.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedFilters.includes(filter.value)
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label}
            {filter.count && (
              <span className="ml-1 text-xs opacity-75">
                ({filter.count})
              </span>
            )}
          </motion.button>
        ))}
        
        {selectedFilters.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={clearAllFilters}
            className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-200 flex items-center"
          >
            <X className="w-3 h-3 mr-1" />
            Очистить
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default FilterChips;
