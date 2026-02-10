import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Utensils, Tag, X } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import LazyImage from './LazyImage';

const NewsBlock = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const response = await apiClient.get('/api/news?limit=6');
      setNews(response.news || []);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'new_dish':
        return <Utensils className="w-5 h-5" />;
      case 'promotion':
        return <Tag className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'new_dish':
        return 'Новое блюдо';
      case 'promotion':
        return 'Акция';
      default:
        return 'Новость';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'new_dish':
        return 'bg-green-100 text-green-800';
      case 'promotion':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!news || news.length === 0) {
    return null;
  }

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Новости и обновления
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Узнайте о наших новинках, акциях и событиях
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer"
              onClick={() => setSelectedNews(item)}
            >
              {/* Изображение */}
              {item.image_url && (
                <div className="relative h-48 overflow-hidden">
                  <LazyImage
                    src={item.image_url.startsWith('http') ? item.image_url : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${item.image_url}`}
                    alt={item.title}
                    className="w-full h-full group-hover:scale-110 transition-transform duration-300"
                    fallbackSrc="/vite.svg"
                  />
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(item.type)}`}>
                      {getTypeIcon(item.type)}
                      <span>{getTypeLabel(item.type)}</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Контент */}
              <div className="p-6">
                {!item.image_url && (
                  <div className="mb-4">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(item.type)}`}>
                      {getTypeIcon(item.type)}
                      <span>{getTypeLabel(item.type)}</span>
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {item.description}
                  </p>
                )}

                <span className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium group-hover:translate-x-1 transition-transform">
                  Подробнее
                  <ArrowRight className="ml-2 w-4 h-4" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* News Popup Modal */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedNews(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-[#fbfbf9] rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                aria-label="Закрыть"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Image */}
              {selectedNews.image_url && (
                <div className="w-full aspect-[4/3] overflow-hidden">
                  <img
                    src={selectedNews.image_url.startsWith('http') ? selectedNews.image_url : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${selectedNews.image_url}`}
                    alt={selectedNews.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-8 text-center">
                {/* Type badge */}
                <div className="mb-4">
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedNews.type)}`}>
                    {getTypeIcon(selectedNews.type)}
                    <span>{getTypeLabel(selectedNews.type)}</span>
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                  {selectedNews.title}
                </h2>

                {/* Description */}
                {selectedNews.description && (
                  <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {selectedNews.description}
                  </div>
                )}

                {/* Link button */}
                {selectedNews.link_url && (
                  <Link
                    to={selectedNews.link_url}
                    className="inline-flex items-center justify-center mt-6 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    onClick={() => setSelectedNews(null)}
                  >
                    Перейти
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default NewsBlock;

