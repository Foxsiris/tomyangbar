import { useState, useEffect } from 'react';
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
import { MenuService } from '../../services/menuService';

const AdminMenu = () => {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    weight: '',
    category_id: '',
    is_popular: false,
    is_active: true,
    image_url: '',
    calories: '',
    proteins: '',
    fats: '',
    carbs: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Загружаем данные из Supabase
  useEffect(() => {
    const loadMenuData = async () => {
      // Проверяем, что токен авторизации есть
      const token = localStorage.getItem('tomyangbar_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [dishesData, categoriesData] = await Promise.all([
          MenuService.getDishes(),
          MenuService.getCategories()
        ]);
        setDishes(dishesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Ошибка при загрузке меню:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMenuData();
  }, []);

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dish.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || dish.category_id?.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Загрузка меню...</div>
      </div>
    );
  }

  const handleAddDish = async () => {
    try {
      let imageUrl = formData.image_url;
      
      // Если загружено новое изображение, загружаем его
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          alert(`Ошибка при загрузке изображения: ${uploadError.message || 'Неизвестная ошибка'}`);
          return; // Прерываем создание, если загрузка изображения не удалась
        }
      }
      
      const newDish = await MenuService.createDish({
        ...formData,
        price: parseInt(formData.price),
        image_url: imageUrl || 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        calories: formData.calories ? parseInt(formData.calories) : null,
        proteins: formData.proteins ? parseFloat(formData.proteins) : null,
        fats: formData.fats ? parseFloat(formData.fats) : null,
        carbs: formData.carbs ? parseFloat(formData.carbs) : null
      });
      setDishes([...dishes, newDish]);
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating dish:', error);
      alert(`Ошибка при создании блюда: ${error.message || 'Неизвестная ошибка'}`);
    }
  };

  const handleEditDish = async () => {
    try {
      let imageUrl = formData.image_url;
      
      // Если загружено новое изображение, загружаем его
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          alert(`Ошибка при загрузке изображения: ${uploadError.message || 'Неизвестная ошибка'}`);
          return; // Прерываем обновление, если загрузка изображения не удалась
        }
      }
      
      const updatedDish = await MenuService.updateDish(editingDish.id, {
        ...formData,
        price: parseInt(formData.price),
        image_url: imageUrl,
        calories: formData.calories ? parseInt(formData.calories) : null,
        proteins: formData.proteins ? parseFloat(formData.proteins) : null,
        fats: formData.fats ? parseFloat(formData.fats) : null,
        carbs: formData.carbs ? parseFloat(formData.carbs) : null
      });
      
      setDishes(dishes.map(dish => 
        dish.id === editingDish.id ? updatedDish : dish
      ));
      setEditingDish(null);
      resetForm();
    } catch (error) {
      console.error('Error updating dish:', error);
      alert(`Ошибка при обновлении блюда: ${error.message || 'Неизвестная ошибка'}`);
    }
  };

  const handleDeleteDish = async (dishId) => {
    if (window.confirm('Вы уверены, что хотите удалить это блюдо?')) {
      try {
        await MenuService.deleteDish(dishId);
        setDishes(dishes.filter(dish => dish.id !== dishId));
      } catch (error) {
        console.error('Error deleting dish:', error);
        alert('Ошибка при удалении блюда');
      }
    }
  };

  const handleEdit = (dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      description: dish.description,
      price: dish.price.toString(),
      weight: dish.weight,
      category_id: dish.category_id,
      is_popular: dish.is_popular,
      is_active: dish.is_active,
      image_url: dish.image_url || '',
      calories: dish.calories ? dish.calories.toString() : '',
      proteins: dish.proteins ? dish.proteins.toString() : '',
      fats: dish.fats ? dish.fats.toString() : '',
      carbs: dish.carbs ? dish.carbs.toString() : ''
    });
    setImagePreview(dish.image_url || null);
    setImageFile(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      weight: '',
      category_id: '',
      is_popular: false,
      is_active: true,
      image_url: '',
      calories: '',
      proteins: '',
      fats: '',
      carbs: ''
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Используем apiClient для определения правильного baseURL
      // В продакшене baseURL будет пустой строкой (относительные пути)
      // В разработке будет 'http://localhost:3001'
      const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development' || !import.meta.env.PROD;
      const baseURL = isDevelopment ? 'http://localhost:3001' : '';
      
      console.log('Uploading image to:', `${baseURL}/api/admin/upload-image`);
      
      const response = await fetch(`${baseURL}/api/admin/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tomyangbar_token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);
        throw new Error(`Ошибка при загрузке изображения: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Upload response:', data);
      
      // Бэкенд возвращает относительный путь /uploads/filename.jpg
      // В продакшене это будет работать через nginx proxy
      // В разработке нужно добавить baseURL
      const imageUrl = data.imageUrl || data.image_url;
      
      if (!imageUrl) {
        throw new Error('Сервер не вернул URL изображения');
      }
      
      // В продакшене возвращаем относительный путь как есть
      // В разработке добавляем baseURL
      return isDevelopment ? `${baseURL}${imageUrl}` : imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
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
              {categories.map((category) => (
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
                src={dish.image_url || dish.image || 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}
                alt={dish.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                }}
              />
              <div className="absolute top-2 right-2 flex space-x-1">
                {dish.is_popular && (
                  <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    Популярное
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs ${
                  dish.is_active 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {dish.is_active ? 'Доступно' : 'Недоступно'}
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
                <span>{getCategoryName(dish.category_id)}</span>
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

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Изображение
                  </label>
                  <div className="space-y-3">
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setImageFile(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    
                    {/* File Input */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    
                    {/* URL Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Или введите URL изображения
                      </label>
                      <input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
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
                
                {/* КБЖУ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    КБЖУ (калории, белки, жиры, углеводы)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Калории</label>
                      <input
                        type="number"
                        value={formData.calories}
                        onChange={(e) => setFormData({...formData, calories: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Белки (г)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.proteins}
                        onChange={(e) => setFormData({...formData, proteins: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Жиры (г)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.fats}
                        onChange={(e) => setFormData({...formData, fats: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Углеводы (г)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.carbs}
                        onChange={(e) => setFormData({...formData, carbs: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Категория *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map((category) => (
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
                    checked={formData.is_popular}
                    onChange={(e) => setFormData({...formData, is_popular: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Популярное</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
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
