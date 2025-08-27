import { useState } from 'react';
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
  MapPin
} from 'lucide-react';
import { ordersData } from '../../data/ordersData';

const AdminOrders = () => {
  const [orders, setOrders] = useState(ordersData);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statusOptions = [
    { value: 'all', label: 'Все заказы', color: 'gray' },
    { value: 'pending', label: 'Ожидает', color: 'yellow' },
    { value: 'preparing', label: 'Готовится', color: 'blue' },
    { value: 'delivering', label: 'Доставляется', color: 'purple' },
    { value: 'completed', label: 'Завершен', color: 'green' },
    { value: 'cancelled', label: 'Отменен', color: 'red' }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.phone.includes(searchQuery) ||
                         order.id.toString().includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
        : order
    ));
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Управление заказами</h2>
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
        {filteredOrders.map((order) => (
          <motion.div
            key={order.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Заказ #{order.id}
                  </h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{order.customer} - {order.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{order.deliveryType === 'delivery' ? order.address : 'Самовывоз'}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{formatTime(order.createdAt)}</span>
                  </div>
                </div>
              </div>
              
                             <div className="text-right">
                 <div className="text-2xl font-bold text-primary-600">{order.finalTotal} ₽</div>
                 <div className="text-sm text-gray-500">{order.items.length} позиций</div>
               </div>
            </div>

            {/* Order Items */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Позиции заказа:</h4>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{item.price * item.quantity} ₽</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-500">Способ получения:</span>
                <span className="ml-2 font-medium">
                  {order.deliveryType === 'delivery' ? 'Доставка' : 'Самовывоз'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Способ оплаты:</span>
                <span className="ml-2 font-medium">
                  {order.paymentMethod === 'cash' ? 'Наличные' : 'Карта'}
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
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                    className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Начать готовить
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
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
                    onClick={() => updateOrderStatus(order.id, 'delivering')}
                    className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 transition-colors flex items-center"
                  >
                    <Truck className="w-4 h-4 mr-1" />
                    Отправить на доставку
                  </button>
                  {order.deliveryType === 'pickup' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'completed')}
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
                  onClick={() => updateOrderStatus(order.id, 'completed')}
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
        ))}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Детали заказа #{selectedOrder.id}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Информация о клиенте</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p><strong>Имя:</strong> {selectedOrder.customer}</p>
                  <p><strong>Телефон:</strong> {selectedOrder.phone}</p>
                  <p><strong>Адрес:</strong> {selectedOrder.address}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Позиции заказа</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                      <span className="font-semibold">{item.price * item.quantity} ₽</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Дополнительная информация</h4>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <p><strong>Способ получения:</strong> {selectedOrder.deliveryType === 'delivery' ? 'Доставка' : 'Самовывоз'}</p>
                  <p><strong>Способ оплаты:</strong> {selectedOrder.paymentMethod === 'cash' ? 'Наличные' : 'Карта'}</p>
                  <p><strong>Время заказа:</strong> {formatTime(selectedOrder.createdAt)}</p>
                  <p><strong>Последнее обновление:</strong> {formatTime(selectedOrder.updatedAt)}</p>
                  {selectedOrder.notes && (
                    <p><strong>Комментарий:</strong> {selectedOrder.notes}</p>
                  )}
                </div>
              </div>
              
              <div className="text-center pt-4 border-t">
                <div className="text-2xl font-bold text-primary-600">
                  Итого: {selectedOrder.total} ₽
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminOrders;
