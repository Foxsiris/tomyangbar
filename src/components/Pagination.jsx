import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = '' 
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {/* Кнопка "Назад" */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </motion.button>

      {/* Номера страниц */}
      {pageNumbers.map((page, index) => (
        <motion.button
          key={index}
          whileHover={{ scale: page !== '...' ? 1.05 : 1 }}
          whileTap={{ scale: page !== '...' ? 0.95 : 1 }}
          onClick={() => page !== '...' && onPageChange(page)}
          disabled={page === '...'}
          className={`px-3 py-2 rounded-lg border transition-colors ${
            page === currentPage
              ? 'bg-primary-600 text-white border-primary-600'
              : page === '...'
              ? 'border-transparent cursor-default'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          {page}
        </motion.button>
      ))}

      {/* Кнопка "Вперед" */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
};

export default Pagination;
