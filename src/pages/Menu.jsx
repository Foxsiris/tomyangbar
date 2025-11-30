import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import { useMenu } from '../hooks/useMenu';
import DishCard from '../components/DishCard';
import MenuFilters from '../components/MenuFilters';
import LoadingSpinner from '../components/LoadingSpinner';

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const { menuData, isLoading, error, getDishesByCategory } = useMenu();

  const filteredDishes = useMemo(() => {
    console.log('Menu.filteredDishes: menuData:', menuData);
    console.log('Menu.filteredDishes: menuData.dishes:', menuData.dishes);
    console.log('Menu.filteredDishes: dishes type:', typeof menuData.dishes);
    console.log('Menu.filteredDishes: dishes is array:', Array.isArray(menuData.dishes));
    
    let filtered = Array.isArray(menuData.dishes) ? menuData.dishes : [];
    console.log('Menu.filteredDishes: Initial filtered count:', filtered.length);

    // Фильтрация по категории
    if (selectedCategory !== 'all') {
      const beforeCount = filtered.length;
      filtered = filtered.filter(dish => dish.category_id === selectedCategory);
      console.log('Menu.filteredDishes: After category filter:', filtered.length, '(was', beforeCount + ')');
    }

    // Фильтрация по поиску
    if (searchQuery) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(dish =>
        dish.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log('Menu.filteredDishes: After search filter:', filtered.length, '(was', beforeCount + ')');
    }

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'popular':
          return (b.is_popular || 0) - (a.is_popular || 0);
        default:
          return 0;
      }
    });

    console.log('Menu.filteredDishes: Final filtered count:', filtered.length);
    return filtered;
  }, [selectedCategory, searchQuery, sortBy, menuData.dishes]);

  const getCategoryName = (categoryId) => {
    const category = menuData.categories?.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Наше меню
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Откройте для себя богатство азиатской кухни с нашими эксклюзивными блюдами
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Фильтры</span>
        </button>
      </div>

      {/* Mobile Filters Overlay */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowMobileFilters(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Фильтры</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <MenuFilters
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  categories={menuData.categories || []}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar - Desktop */}
            <div className="hidden lg:block lg:w-80 flex-shrink-0">
              <MenuFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                sortBy={sortBy}
                setSortBy={setSortBy}
                categories={menuData.categories || []}
              />
            </div>

            {/* Menu Grid */}
            <div className="flex-1">
              {/* Results Info */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {getCategoryName(selectedCategory)}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Найдено {filteredDishes.length} блюд
                  </p>
                </div>
                {searchQuery && (
                  <p className="text-sm text-gray-600 mt-1">
                    Поиск: "{searchQuery}"
                  </p>
                )}
              </div>

              {/* Dishes Grid */}
              {filteredDishes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-white rounded-lg"
                >
                  <div className="text-6xl mb-4">🍽️</div>
                  <p className="text-lg text-gray-600 mb-2">
                    По вашему запросу ничего не найдено
                  </p>
                  <p className="text-sm text-gray-500">
                    Попробуйте изменить фильтры или поисковый запрос
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredDishes.map((dish, index) => (
                    <DishCard key={dish.id} dish={dish} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Menu;
