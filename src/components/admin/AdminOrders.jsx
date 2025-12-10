import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle,
  Search,
  Filter,
  Eye,
  Phone,
  MapPin,
  Bell,
  BellRing
} from 'lucide-react';
import { OrderService } from '../../services/orderService';
import OrderDetailsModal from './OrderDetailsModal';
import { getDisplayOrderNumber } from '../../utils/orderUtils';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [lastOrderCount, setLastOrderCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Загружаем заказы из Supabase
  useEffect(() => {
    const loadOrders = async () => {
      // Проверяем, что токен авторизации есть
      const token = localStorage.getItem('tomyangbar_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const ordersData = await OrderService.getAllOrders();
        setOrders(ordersData);
        setLastOrderCount(ordersData.length);
      } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // Отслеживаем новые заказы
  useEffect(() => {
    const currentOrderCount = orders.length;
    if (currentOrderCount > lastOrderCount) {
      setNewOrdersCount(currentOrderCount - lastOrderCount);
    }
    setLastOrderCount(currentOrderCount);
  }, [orders, lastOrderCount]);

  // Сбрасываем счетчик новых заказов при изменении фильтров
  useEffect(() => {
    if (statusFilter === 'all' || statusFilter === 'pending') {
      setNewOrdersCount(0);
    }
  }, [statusFilter]);

  const statusOptions = [
    { value: 'all', label: 'Все заказы', color: 'gray' },
    { value: 'pending', label: 'Ожидает', color: 'yellow' },
    { value: 'preparing', label: 'Готовится', color: 'blue' },
    { value: 'delivering', label: 'Доставляется', color: 'purple' },
    { value: 'completed', label: 'Завершен', color: 'green' },
    { value: 'cancelled', label: 'Отменен', color: 'red' }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.phone?.includes(searchQuery) ||
                         order.id.toString().includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Обновляем статус в Supabase
      const updatedOrder = await OrderService.updateOrderStatus(orderId, newStatus);
      
      if (updatedOrder) {
        // Обновляем локальное состояние, сохраняя все данные заказа
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId
              ? { ...order, status: updatedOrder.status, updated_at: updatedOrder.updated_at }
              : order
          )
        );
        
        // Обновляем выбранный заказ в модалке, если он открыт
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({
            ...prev,
            status: updatedOrder.status,
            updated_at: updatedOrder.updated_at
          }));
        }
      }
    } catch (error) {
      console.error('Ошибка при обновлении статуса заказа:', error);
      alert('Ошибка при обновлении статуса заказа');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'delivering': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Загрузка заказов...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Управление заказами</h2>
          {newOrdersCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium"
            >
              <BellRing className="w-4 h-4 mr-1" />
              {newOrdersCount} новый заказ
            </motion.div>
          )}
        </div>
        <p className="text-gray-600">Просматривайте и обновляйте статусы заказов</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Поиск по клиенту, телефону или ID заказа..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order, index) => {
          // Определяем, является ли заказ новым (первые 3 заказа считаются новыми)
          const isNewOrder = index < 3 && order.status === 'pending';
          
          return (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-lg shadow-lg p-6 ${
                isNewOrder ? 'ring-2 ring-red-200 bg-red-50' : ''
              }`}
            >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Заказ {getDisplayOrderNumber(order)}
                  </h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  {isNewOrder && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800"
                    >
                      НОВЫЙ
                    </motion.span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{order.customer_name} - {order.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{order.delivery_type === 'delivery' ? order.address : 'Самовывоз'}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{formatTime(order.created_at)}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">{order.final_total} ₽</div>
                <div className="text-sm text-gray-500">{order.order_items?.length || 0} позиций</div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Позиции заказа:</h4>
              <div className="space-y-2">
                {order.order_items?.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.dish_name} x{item.quantity}</span>
                    <span>{item.price * item.quantity} ₽</span>
                  </div>
                )) || <div className="text-sm text-gray-500">Позиции не найдены</div>}
              </div>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-500">Способ получения:</span>
                <span className="ml-2 font-medium">
                  {order.delivery_type === 'delivery' ? 'Доставка' : 'Самовывоз'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Способ оплаты:</span>
                <span className="ml-2 font-medium">
                  {order.payment_method === 'cash' ? 'Наличные' : 'Карта'}
                </span>
              </div>
              {order.notes && (
                <div className="md:col-span-2">
                  <span className="text-gray-500">Комментарий:</span>
                  <span className="ml-2 font-medium">{order.notes}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {order.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusChange(order.id, 'preparing')}
                    className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Начать готовить
                  </button>
                  <button
                    onClick={() => handleStatusChange(order.id, 'cancelled')}
                    className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Отменить
                  </button>
                </>
              )}
              
              {order.status === 'preparing' && (
                <>
                  <button
                    onClick={() => handleStatusChange(order.id, 'delivering')}
                    className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 transition-colors flex items-center"
                  >
                    <Truck className="w-4 h-4 mr-1" />
                    Отправить на доставку
                  </button>
                  {order.delivery_type === 'pickup' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'completed')}
                      className="bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Готов к выдаче
                    </button>
                  )}
                </>
              )}
              
              {order.status === 'delivering' && (
                <button
                  onClick={() => handleStatusChange(order.id, 'completed')}
                  className="bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Завершить доставку
                </button>
              )}
              
              <button
                onClick={() => setSelectedOrder(order)}
                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
              >
                <Eye className="w-4 h-4 mr-1" />
                Подробности
              </button>
            </div>
          </motion.div>
          );
        })}
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};

export default AdminOrders;
