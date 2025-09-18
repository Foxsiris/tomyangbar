import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Package, 
  LogOut,
  Edit3,
  CheckCircle,
  XCircle,
  ChefHat,
  Truck
} from 'lucide-react';
import { useSupabaseUser } from '../context/SupabaseUserContext';
import OrderStatusProgress from '../components/OrderStatusProgress';

const Profile = () => {
  const { user, logout, updateUser, getUserOrders } = useSupabaseUser();
  const [userOrders, setUserOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Функция для загрузки заказов
  const loadUserOrders = useCallback(async () => {
    if (!user) return;
    
    try {
      const userOrdersList = await getUserOrders();
      setUserOrders(userOrdersList || []);
    } catch (error) {
      console.error('Error loading user orders:', error);
      setUserOrders([]);
    }
  }, [user, getUserOrders]);

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      
      loadUserOrders();
    }
  }, [user, loadUserOrders]);

  // Обновляем заказы при изменении localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      if (user) {
        loadUserOrders();
      }
    };

    // Слушаем изменения localStorage из других вкладок
    window.addEventListener('storage', handleStorageChange);
    
    // Слушаем изменения localStorage из той же вкладки
    const handleCustomStorageChange = (event) => {
      if (event.detail && event.detail.type === 'orderStatusUpdated') {
        handleStorageChange();
      }
    };
    
    window.addEventListener('customStorageChange', handleCustomStorageChange);
    
    // Обновляем заказы при фокусе на вкладку
    const handleFocus = () => {
      if (user) {
        loadUserOrders();
      }
    };

    window.addEventListener('focus', handleFocus);

    // Периодическое обновление заказов каждые 30 секунд
    const interval = setInterval(() => {
      if (user) {
        loadUserOrders();
      }
    }, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customStorageChange', handleCustomStorageChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [user, loadUserOrders]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    updateUser(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || ''
    });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock;
      case 'preparing': return ChefHat;
      case 'delivering': return Truck;
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return Package;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'preparing': return 'text-blue-600 bg-blue-100';
      case 'delivering': return 'text-purple-600 bg-purple-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'preparing': return 'Готовится';
      case 'delivering': return 'Доставляется';
      case 'completed': return 'Завершен';
      case 'cancelled': return 'Отменен';
      default: return 'Неизвестно';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Необходима авторизация
          </h2>
          <p className="text-gray-600">
            Войдите в систему, чтобы просмотреть личный кабинет
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200 to-red-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200 to-orange-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mb-6 shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
            Личный кабинет
          </h1>
          <p className="text-gray-600 text-lg">Добро пожаловать, {user.name}! Управляйте своими заказами и данными</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 relative overflow-hidden"
            >
              {/* Card background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-100 to-orange-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
              <div className="relative z-10 flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Личная информация
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">Управляйте своими данными</p>
                </div>
                {!isEditing ? (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleEdit}
                    className="p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Edit3 className="w-5 h-5" />
                  </motion.button>
                ) : (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSave}
                      className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCancel}
                      className="p-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <XCircle className="w-5 h-5" />
                    </motion.button>
                  </div>
                )}
              </div>

              <div className="relative z-10 space-y-6">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center p-4 bg-white/50 rounded-xl border border-white/30 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mr-4">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleInputChange}
                      className="flex-1 px-4 py-2 bg-white/80 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      placeholder="Ваше имя"
                    />
                  ) : (
                    <div>
                      <span className="text-gray-900 font-medium">{user.name}</span>
                      <p className="text-gray-500 text-sm">Полное имя</p>
                    </div>
                  )}
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center p-4 bg-white/50 rounded-xl border border-white/30 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mr-4">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleInputChange}
                      className="flex-1 px-4 py-2 bg-white/80 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      placeholder="Ваш email"
                    />
                  ) : (
                    <div>
                      <span className="text-gray-900 font-medium">{user.email}</span>
                      <p className="text-gray-500 text-sm">Email адрес</p>
                    </div>
                  )}
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center p-4 bg-white/50 rounded-xl border border-white/30 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-full mr-4">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={editData.phone}
                      onChange={handleInputChange}
                      className="flex-1 px-4 py-2 bg-white/80 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      placeholder="Ваш телефон"
                    />
                  ) : (
                    <div>
                      <span className="text-gray-900 font-medium">{user.phone || 'Не указан'}</span>
                      <p className="text-gray-500 text-sm">Номер телефона</p>
                    </div>
                  )}
                </motion.div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={logout}
                className="relative z-10 w-full mt-8 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
              >
                <LogOut className="w-5 h-5" />
                Выйти из аккаунта
              </motion.button>
            </motion.div>
          </div>

          {/* Orders */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                  Мои заказы
                </h2>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-medium">
                    {userOrders.length} заказ{userOrders.length === 1 ? '' : userOrders.length < 5 ? 'а' : 'ов'}
                  </div>
                  <p className="text-gray-600">Отслеживайте статус ваших заказов</p>
                </div>
              </div>

              {userOrders.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center relative overflow-hidden"
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-100 to-orange-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
                  
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mb-6 shadow-lg">
                      <Package className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      У вас пока нет заказов
                    </h3>
                    <p className="text-gray-600 text-lg mb-6">
                      Сделайте первый заказ, чтобы отслеживать его статус здесь
                    </p>
                    <Link to="/menu">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Сделать заказ
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {userOrders.map((order) => {
                    const StatusIcon = getStatusIcon(order.status);
                    
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden relative"
                      >
                        {/* Card background decoration */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full -translate-y-12 translate-x-12 opacity-30"></div>
                        {/* Order Header */}
                        <div className="relative z-10 p-8 border-b border-white/20">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full">
                                <Package className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-gray-900">
                                  Заказ #{order.order_number || order.id}
                                </h3>
                                <p className="text-gray-500 text-sm">от {formatDate(order.created_at || order.createdAt)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                {order.final_total || order.finalTotal} ₽
                              </div>
                              <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                                <StatusIcon className="w-4 h-4" />
                                {getStatusText(order.status)}
                              </span>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 mb-4 text-lg">
                              Позиции заказа:
                            </h4>
                            <div className="space-y-3">
                              {(order.items || order.order_items || []).map((item, index) => (
                                <motion.div 
                                  key={index} 
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-white/30"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                      {item.quantity}
                                    </div>
                                    <span className="font-medium text-gray-900">{item.dish_name || item.name}</span>
                                  </div>
                                  <span className="font-bold text-orange-600">{item.price * item.quantity} ₽</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Order Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <motion.div 
                              whileHover={{ scale: 1.02 }}
                              className="flex items-center p-3 bg-white/50 rounded-xl border border-white/30"
                            >
                              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mr-3">
                                <MapPin className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {(order.delivery_type || order.deliveryType) === 'delivery' ? 'Доставка' : 'Самовывоз'}
                                </p>
                                <p className="text-gray-500 text-sm">Способ получения</p>
                              </div>
                            </motion.div>
                            <motion.div 
                              whileHover={{ scale: 1.02 }}
                              className="flex items-center p-3 bg-white/50 rounded-xl border border-white/30"
                            >
                              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-full mr-3">
                                <Clock className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {(order.delivery_time || order.deliveryTime) === 'asap' ? 'Как можно скорее' : 'На определенное время'}
                                </p>
                                <p className="text-gray-500 text-sm">Время доставки</p>
                              </div>
                            </motion.div>
                          </div>
                        </div>

                        {/* Order Status Progress */}
                        <div className="relative z-10 p-8 bg-gradient-to-r from-orange-50 to-red-50">
                          <h4 className="font-semibold text-gray-900 mb-4 text-lg">Статус заказа</h4>
                          <OrderStatusProgress 
                            status={order.status} 
                            orderId={order.id}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
