import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { useUser } from '../context/UserContext';
import { getOrdersData } from '../data/ordersData';
import { getUserOrders } from '../data/usersData';
import OrderStatusProgress from '../components/OrderStatusProgress';

const Profile = () => {
  const { user, logout, updateUser } = useUser();
  const [userOrders, setUserOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      
      // Получаем заказы пользователя из его истории
      const userOrdersList = getUserOrders(user.id);
      setUserOrders(userOrdersList);
    }
  }, [user]);

  // Обновляем заказы при изменении localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      if (user) {
        const userOrdersList = getUserOrders(user.id);
        setUserOrders(userOrdersList);
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
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customStorageChange', handleCustomStorageChange);
    };
  }, [user]);

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Личный кабинет</h1>
          <p className="text-gray-600 mt-2">Управляйте своими заказами и данными</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Личная информация
                </h2>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="p-2 text-green-600 hover:text-green-700 transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-2 text-red-600 hover:text-red-700 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ) : (
                    <span className="text-gray-900">{user.name}</span>
                  )}
                </div>

                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ) : (
                    <span className="text-gray-900">{user.email}</span>
                  )}
                </div>

                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={editData.phone}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ) : (
                    <span className="text-gray-900">{user.phone || 'Не указан'}</span>
                  )}
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Выйти из аккаунта
              </button>
            </motion.div>
          </div>

          {/* Orders */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Мои заказы ({userOrders.length})
              </h2>

              {userOrders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    У вас пока нет заказов
                  </h3>
                  <p className="text-gray-600">
                    Сделайте первый заказ, чтобы отслеживать его статус здесь
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {userOrders.map((order) => {
                    const StatusIcon = getStatusIcon(order.status);
                    
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                      >
                        {/* Order Header */}
                        <div className="p-6 border-b border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-gray-900">
                                Заказ #{order.id}
                              </h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                <StatusIcon className="w-3 h-3" />
                                {getStatusText(order.status)}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary-600">
                                {order.finalTotal} ₽
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDate(order.createdAt)}
                              </div>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">
                              Позиции заказа:
                            </h4>
                            <div className="space-y-1">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm text-gray-600">
                                  <span>{item.name} x{item.quantity}</span>
                                  <span>{item.price * item.quantity} ₽</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-gray-600">
                                {order.deliveryType === 'delivery' ? 'Доставка' : 'Самовывоз'}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-gray-600">
                                {order.deliveryTime === 'asap' ? 'Как можно скорее' : 'На определенное время'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Order Status Progress */}
                        <div className="p-6">
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
