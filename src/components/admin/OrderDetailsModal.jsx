import { motion, AnimatePresence } from 'framer-motion';
import { getDisplayOrderNumber } from '../../utils/orderUtils';
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  CreditCard, 
  Truck, 
  Store, 
  ShoppingBag,
  Calendar,
  MessageSquare,
  DollarSign,
  Package,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const OrderDetailsModal = ({ order, isOpen, onClose }) => {
  if (!order || !isOpen) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivering': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'preparing': return <Package className="w-4 h-4" />;
      case 'delivering': return <Truck className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalItems = (order.order_items || []).reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.5 
          }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Заказ {getDisplayOrderNumber(order)}</h2>
                  <p className="text-primary-100">Детальная информация</p>
                </div>
              </div>
              
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                onClick={onClose}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border-2 mt-4 ${getStatusColor(order.status)}`}
            >
              {getStatusIcon(order.status)}
              <span className="font-medium">{getStatusText(order.status)}</span>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-50 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary-600" />
                  Информация о клиенте
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 rounded-full p-2">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Имя</p>
                      <p className="font-medium text-gray-900">{order.customer_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 rounded-full p-2">
                      <Phone className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Телефон</p>
                      <p className="font-medium text-gray-900">{order.phone}</p>
                    </div>
                  </div>
                  
                  {order.email && (
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary-100 rounded-full p-2">
                        <MessageSquare className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{order.email}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 rounded-full p-2">
                      <MapPin className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Адрес</p>
                      <p className="font-medium text-gray-900">{order.delivery_address}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Order Details */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-50 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                  Детали заказа
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 rounded-full p-2">
                      {order.delivery_type === 'delivery' ? (
                        <Truck className="w-4 h-4 text-primary-600" />
                      ) : (
                        <Store className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Способ получения</p>
                      <p className="font-medium text-gray-900">
                        {order.delivery_type === 'delivery' ? 'Доставка' : 'Самовывоз'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 rounded-full p-2">
                      <CreditCard className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Способ оплаты</p>
                      <p className="font-medium text-gray-900">
                        {order.payment_method === 'cash' ? 'Наличные' : 'Банковская карта'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 rounded-full p-2">
                      <Clock className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Время заказа</p>
                      <p className="font-medium text-gray-900">{formatTime(order.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 rounded-full p-2">
                      <Calendar className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Последнее обновление</p>
                      <p className="font-medium text-gray-900">{formatTime(order.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-primary-600" />
                  Позиции заказа ({totalItems} шт.)
                </h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {(order.order_items || []).map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary-100 rounded-lg p-3">
                        <Package className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.dish_name}</p>
                        <p className="text-sm text-gray-500">Количество: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{item.price * item.quantity} ₽</p>
                      <p className="text-sm text-gray-500">{item.price} ₽ за шт.</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Notes */}
            {order.notes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-yellow-600" />
                  Комментарий к заказу
                </h3>
                <p className="text-gray-700">{order.notes}</p>
              </motion.div>
            )}

            {/* Total */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, type: "spring", stiffness: 300 }}
              className="mt-6 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 rounded-full p-2">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-primary-100">Итого к оплате</p>
                    <p className="text-2xl font-bold">{order.final_total} ₽</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-primary-100">Стоимость блюд</p>
                  <p className="text-lg font-semibold">{order.subtotal} ₽</p>
                  {order.delivery_fee > 0 && (
                    <>
                      <p className="text-primary-100 mt-1">Доставка</p>
                      <p className="text-lg font-semibold">{order.delivery_fee} ₽</p>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderDetailsModal;
