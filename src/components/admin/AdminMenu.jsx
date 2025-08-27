import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Eye,
  EyeOff,
  Star
} from 'lucide-react';
import { menuData } from '../../data/menuData';

const AdminMenu = () => {
  const [dishes, setDishes] = useState(menuData.dishes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    weight: '',
    category: '',
    popular: false,
    available: true
  });

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || dish.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddDish = () => {
    const newDish = {
      id: Date.now(),
      ...formData,
      price: parseInt(formData.price),
      image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    };
    setDishes([...dishes, newDish]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditDish = () => {
    setDishes(dishes.map(dish => 
      dish.id === editingDish.id 
        ? { ...dish, ...formData, price: parseInt(formData.price) }
        : dish
    ));
    setEditingDish(null);
    resetForm();
  };

  const handleDeleteDish = (dishId) => {
    if (window.confirm('Вы уверены, что хотите удалить это блюдо?')) {
      setDishes(dishes.filter(dish => dish.id !== dishId));
    }
  };

  const handleEdit = (dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      description: dish.description,
      price: dish.price.toString(),
      weight: dish.weight,
      category: dish.category,
      popular: dish.popular,
      available: dish.available
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      weight: '',
      category: '',
      popular: false,
      available: true
    });
  };

  const getCategoryName = (categoryId) => {
    const category = menuData.categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Управление меню</h2>
          <p className="text-gray-600">Добавляйте, редактируйте и удаляйте блюда</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить блюдо
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Поиск блюд..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Все категории</option>
              {menuData.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDishes.map((dish) => (
          <motion.div
            key={dish.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="relative">
              <img
                src={dish.image}
                alt={dish.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 flex space-x-1">
                {dish.popular && (
                  <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    Популярное
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs ${
                  dish.available 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {dish.available ? 'Доступно' : 'Недоступно'}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{dish.name}</h3>
                <div className="text-lg font-bold text-primary-600">{dish.price} ₽</div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{dish.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{dish.weight}</span>
                <span>{getCategoryName(dish.category)}</span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(dish)}
                  className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Редактировать
                </button>
                <button
                  onClick={() => handleDeleteDish(dish.id)}
                  className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || editingDish) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowAddModal(false);
              setEditingDish(null);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingDish ? 'Редактировать блюдо' : 'Добавить блюдо'}
              </h3>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Название блюда"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Описание блюда"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Цена *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Вес
                    </label>
                    <input
                      type="text"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="300г"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Категория *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Выберите категорию</option>
                    {menuData.categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.popular}
                      onChange={(e) => setFormData({...formData, popular: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Популярное</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({...formData, available: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Доступно</span>
                  </label>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={editingDish ? handleEditDish : handleAddDish}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {editingDish ? 'Сохранить' : 'Добавить'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingDish(null);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminMenu;
