import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search } from 'lucide-react';
import { useMenuContext } from '../context/MenuContext';
import DishCard from '../components/DishCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { menuData, isLoading, error } = useMenuContext();

  // Получаем изображение категории (если есть) или первое блюдо категории
  const getCategoryImage = (categoryId) => {
    const category = menuData.categories?.find(c => c.id === categoryId);
    if (category?.image_url) {
      return category.image_url;
    }
    // Fallback: берем изображение первого блюда в категории
    const dish = menuData.dishes?.find(d => d.category_id === categoryId);
    return dish?.image_url || dish?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
  };

  // Получаем количество блюд в категории
  const getCategoryDishCount = (categoryId) => {
    return menuData.dishes?.filter(d => d.category_id === categoryId).length || 0;
  };

  // Фильтрация блюд по выбранной категории и поиску
  const filteredDishes = useMemo(() => {
    let filtered = Array.isArray(menuData.dishes) ? menuData.dishes : [];

    if (selectedCategory) {
      filtered = filtered.filter(dish => dish.category_id === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(dish =>
        dish.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery, menuData.dishes]);

  // Фильтрация категорий по поиску (если есть поисковый запрос, показываем только категории с совпадающими блюдами)
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return menuData.categories || [];
    
    const categoriesWithMatches = new Set();
    menuData.dishes?.forEach(dish => {
      if (dish.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dish.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        categoriesWithMatches.add(dish.category_id);
      }
    });
    
    return (menuData.categories || []).filter(cat => categoriesWithMatches.has(cat.id));
  }, [searchQuery, menuData.categories, menuData.dishes]);

  const getCategoryName = (categoryId) => {
    const category = menuData.categories?.find(cat => cat.id === categoryId);
    return category ? category.name : '';
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ошибка загрузки меню</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Доставка
            </h1>
            <p className="text-gray-600">
              Выберите категорию или найдите блюдо
            </p>
          </motion.div>

          {/* Search */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Поиск блюд..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {!selectedCategory ? (
              /* Categories Grid */
              <motion.div
                key="categories"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {filteredCategories.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-lg text-gray-600">
                      Ничего не найдено по запросу "{searchQuery}"
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredCategories.map((category, index) => (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        onClick={() => handleCategoryClick(category.id)}
                        className="cursor-pointer group"
                      >
                        <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                          <div className="aspect-[4/3] overflow-hidden">
                            <img
                              src={getCategoryImage(category.id)}
                              alt={category.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                              }}
                            />
                          </div>
                          <div className="absolute bottom-3 left-3">
                            <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                              <h3 className="font-medium text-gray-900 text-sm">
                                {category.name}
                              </h3>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              /* Dishes Grid */
              <motion.div
                key="dishes"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Back Button & Category Title */}
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={handleBackToCategories}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Назад</span>
                  </button>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {getCategoryName(selectedCategory)}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {filteredDishes.length} блюд
                    </p>
                  </div>
                </div>

                {/* Dishes */}
                {filteredDishes.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg">
                    <div className="text-6xl mb-4">🍽️</div>
                    <p className="text-lg text-gray-600">
                      В этой категории пока нет блюд
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredDishes.map((dish, index) => (
                      <DishCard key={dish.id} dish={dish} index={index} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default Menu;
