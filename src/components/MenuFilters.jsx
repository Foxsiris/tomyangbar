import { Search, Filter, SortAsc, SortDesc, Star } from 'lucide-react';

const MenuFilters = ({ 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory, 
  sortBy, 
  setSortBy,
  categories 
}) => {
  return (
    <div className="w-full lg:w-80 bg-white shadow-lg rounded-lg p-6 lg:sticky lg:top-4 h-fit">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <img 
            src="/logo.png" 
            alt="Tom Yang Bar" 
            className="w-8 h-8 mr-2 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🦆</text></svg>';
            }}
          />
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="w-5 h-5 mr-2 text-primary-600" />
            Фильтры
          </h3>
        </div>
        <p className="text-sm text-gray-500">Найдите идеальное блюдо</p>
        <p className="text-xs text-gray-400 mt-1">フィルター</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Поиск
          <span className="text-xs text-gray-400 ml-2">検索</span>
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Название блюда..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Категории
          <span className="text-xs text-gray-400 ml-2">カテゴリー</span>
        </label>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === 'all'
                ? 'bg-primary-100 text-primary-700 border border-primary-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Все блюда
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Сортировка
          <span className="text-xs text-gray-400 ml-2">ソート</span>
        </label>
        <div className="space-y-2">
          <button
            onClick={() => setSortBy('name')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center ${
              sortBy === 'name'
                ? 'bg-primary-100 text-primary-700 border border-primary-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SortAsc className="w-4 h-4 mr-2" />
            По названию
          </button>
          <button
            onClick={() => setSortBy('price-low')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center ${
              sortBy === 'price-low'
                ? 'bg-primary-100 text-primary-700 border border-primary-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SortAsc className="w-4 h-4 mr-2" />
            По цене (возрастание)
          </button>
          <button
            onClick={() => setSortBy('price-high')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center ${
              sortBy === 'price-high'
                ? 'bg-primary-100 text-primary-700 border border-primary-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SortDesc className="w-4 h-4 mr-2" />
            По цене (убывание)
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center ${
              sortBy === 'popular'
                ? 'bg-primary-100 text-primary-700 border border-primary-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Star className="w-4 h-4 mr-2" />
            Популярные
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setSortBy('name');
          }}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          <div className="flex items-center justify-center">
            <span>Сбросить фильтры</span>
            <span className="text-xs opacity-75 ml-2">リセット</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default MenuFilters;
