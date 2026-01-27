import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, EyeOff, Sparkles, Utensils, Tag, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

const AdminNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    type: 'news',
    dish_id: '',
    link_url: '',
    is_active: true,
    sort_order: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/news/admin/all');
      setNews(response.news || []);
    } catch (error) {
      console.error('Error loading news:', error);
      alert('Ошибка при загрузке новостей');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (newsItem = null) => {
    if (newsItem) {
      setEditingNews(newsItem);
      setFormData({
        title: newsItem.title || '',
        description: newsItem.description || '',
        image_url: newsItem.image_url || '',
        type: newsItem.type || 'news',
        dish_id: newsItem.dish_id || '',
        link_url: newsItem.link_url || '',
        is_active: newsItem.is_active !== undefined ? newsItem.is_active : true,
        sort_order: newsItem.sort_order || 0
      });
      setImagePreview(newsItem.image_url || null);
    } else {
      setEditingNews(null);
      setFormData({
        title: '',
        description: '',
        image_url: '',
        type: 'news',
        dish_id: '',
        link_url: '',
        is_active: true,
        sort_order: 0
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNews(null);
    setImageFile(null);
    setImagePreview(null);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      type: 'news',
      dish_id: '',
      link_url: '',
      is_active: true,
      sort_order: 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = formData.image_url;

      // Если выбран файл, загружаем его
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          alert('Ошибка при загрузке изображения. Попробуйте еще раз.');
          return;
        }
      }

      const submitData = {
        ...formData,
        image_url: imageUrl,
        dish_id: formData.dish_id ? parseInt(formData.dish_id) : null,
        sort_order: parseInt(formData.sort_order) || 0
      };

      if (editingNews) {
        await apiClient.updateNews(editingNews.id, submitData);
      } else {
        await apiClient.createNews(submitData);
      }

      await loadNews();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving news:', error);
      alert('Ошибка при сохранении новости');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    const token = localStorage.getItem('tomyangbar_token');
    const baseURL = apiClient.baseURL || 'http://localhost:3001';

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${baseURL}/api/admin/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка при загрузке изображения');
    }

    const data = await response.json();
    // Бэкенд теперь возвращает полный URL из Supabase Storage
    return data.imageUrl;
  };

  const handleDelete = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить эту новость?')) {
      return;
    }

    try {
      await apiClient.deleteNews(id);
      await loadNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      alert('Ошибка при удалении новости');
    }
  };

  const toggleActive = async (newsItem) => {
    try {
      await apiClient.updateNews(newsItem.id, {
        is_active: !newsItem.is_active
      });
      await loadNews();
    } catch (error) {
      console.error('Error toggling active:', error);
      alert('Ошибка при изменении статуса');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'new_dish':
        return <Utensils className="w-4 h-4" />;
      case 'promotion':
        return <Tag className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Управление новостями</h2>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Добавить новость</span>
          </button>
        </div>
        <p className="text-gray-600">
          Управляйте новостями, новыми блюдами и акциями, которые отображаются на главной странице
        </p>
      </div>

      {/* News List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow-lg p-8 text-center">
            <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Нет новостей. Добавьте первую новость!</p>
          </div>
        ) : (
          news.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              {/* Image */}
              {item.image_url && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image_url.startsWith('http') ? item.image_url : `${apiClient.baseURL || 'http://localhost:3001'}${item.image_url}`}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/vite.svg';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800">
                      {getTypeIcon(item.type)}
                      <span>{getTypeLabel(item.type)}</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                {!item.image_url && (
                  <div className="mb-2">
                    <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {getTypeIcon(item.type)}
                      <span>{getTypeLabel(item.type)}</span>
                    </span>
                  </div>
                )}

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>Порядок: {item.sort_order}</span>
                  <span className={`px-2 py-1 rounded ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {item.is_active ? 'Активна' : 'Неактивна'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleActive(item)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.is_active
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {item.is_active ? <EyeOff className="w-4 h-4 inline mr-1" /> : <Eye className="w-4 h-4 inline mr-1" />}
                    {item.is_active ? 'Скрыть' : 'Показать'}
                  </button>
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="px-3 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {editingNews ? 'Редактировать новость' : 'Добавить новость'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Заголовок <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Введите заголовок"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Введите описание"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Изображение
                  </label>
                  
                  {/* Превью изображения */}
                  {(imagePreview || formData.image_url) && (
                    <div className="mb-4">
                      <img
                        src={imagePreview || (formData.image_url.startsWith('http') ? formData.image_url : `${apiClient.baseURL || 'http://localhost:3001'}${formData.image_url}`)}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/vite.svg';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          setFormData({ ...formData, image_url: '' });
                        }}
                        className="mt-2 text-sm text-red-600 hover:text-red-700"
                      >
                        Удалить изображение
                      </button>
                    </div>
                  )}

                  {/* Загрузка файла */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Загрузить файл
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                  </div>

                  {/* Или URL */}
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => {
                        setFormData({ ...formData, image_url: e.target.value });
                        if (!imageFile) {
                          setImagePreview(e.target.value);
                        }
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Или введите URL изображения"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Вы можете загрузить файл или указать URL изображения
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Тип <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="news">Новость</option>
                      <option value="new_dish">Новое блюдо</option>
                      <option value="promotion">Акция</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Порядок сортировки
                    </label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID блюда (если это новое блюдо)
                  </label>
                  <input
                    type="number"
                    value={formData.dish_id}
                    onChange={(e) => setFormData({ ...formData, dish_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Оставьте пустым, если не применимо"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ссылка (URL)
                  </label>
                  <input
                    type="url"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="/menu или https://example.com"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                    Активна (отображается на сайте)
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {editingNews ? 'Сохранить' : 'Создать'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminNews;

