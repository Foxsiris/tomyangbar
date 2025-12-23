import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const TelegramPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const telegramUrl = 'https://t.me/+Hz9Hs4NirNI5ZDc6';

  useEffect(() => {
    // Проверяем, показывали ли мы уже popup
    const hasSeenPopup = localStorage.getItem('telegramPopupSeen');
    
    if (!hasSeenPopup) {
      // Небольшая задержка для плавного появления
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = (e) => {
    e.stopPropagation();
    setIsVisible(false);
    localStorage.setItem('telegramPopupSeen', 'true');
  };

  const handleClick = () => {
    window.open(telegramUrl, '_blank');
    setIsVisible(false);
    localStorage.setItem('telegramPopupSeen', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            {/* Popup Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30 
              }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Content */}
              <div className="text-center pt-10" onClick={handleClick}>
                <div className="mb-3">
                  <div className="bg-red-600 rounded-lg p-2 inline-block">
                    <img 
                      src="/main_text.png" 
                      alt="Tom Yang Bar" 
                      className="h-16 md:h-24 mx-auto object-contain"
                    />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Залетай к нам в тг канал
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Показываем, как живёт ресторан, и разыгрываем подарки
                </p>

                <button
                  onClick={handleClick}
                  className="btn-primary w-full inline-flex items-center justify-center space-x-2"
                >
                  <span>ПОДПИСАТЬСЯ</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TelegramPopup;

