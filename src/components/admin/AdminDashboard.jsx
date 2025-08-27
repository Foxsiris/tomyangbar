import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  DollarSign,
  Clock,
  Users,
  Star,
  AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  // Моковые данные для демонстрации
  const stats = {
    totalOrders: 156,
    totalRevenue: 234500,
    totalDishes: 45,
    activeOrders: 8,
    avgOrderValue: 1503,
    popularDish: 'Том Ям',
    peakHour: '19:00',
    customerRating: 4.8
  };

  const recentOrders = [
    { id: 1, customer: 'Анна К.', amount: 1200, status: 'pending', time: '2 мин назад' },
    { id: 2, customer: 'Михаил С.', amount: 850, status: 'preparing', time: '5 мин назад' },
    { id: 3, customer: 'Елена В.', amount: 2100, status: 'delivering', time: '12 мин назад' },
    { id: 4, customer: 'Дмитрий П.', amount: 950, status: 'completed', time: '25 мин назад' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'delivering': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'preparing': return 'Готовится';
      case 'delivering': return 'Доставляется';
      case 'completed': return 'Завершен';
      default: return 'Неизвестно';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Панель управления</h2>
        <p className="text-gray-600">Обзор деятельности ресторана</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего заказов</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+12% с прошлой недели</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Общая выручка</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()} ₽</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+8% с прошлой недели</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Активные заказы</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <span>Требуют внимания</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Средний чек</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgOrderValue} ₽</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+5% с прошлой недели</span>
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Быстрая статистика</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="text-gray-700">Рейтинг клиентов</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.customerRating}/5</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Package className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-gray-700">Популярное блюдо</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.popularDish}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-gray-700">Пиковое время</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.peakHour}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-purple-500 mr-2" />
                <span className="text-gray-700">Блюд в меню</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.totalDishes}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Последние заказы</h3>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{order.customer}</div>
                  <div className="text-sm text-gray-500">{order.time}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{order.amount} ₽</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Посмотреть все заказы →
            </button>
          </div>
        </motion.div>
      </div>

      {/* Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
          Уведомления
        </h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <div className="font-medium text-yellow-800">Низкий запас ингредиентов</div>
              <div className="text-sm text-yellow-600">Требуется пополнение: рис, соевый соус</div>
            </div>
          </div>
          <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <div className="font-medium text-blue-800">Новый отзыв</div>
              <div className="text-sm text-blue-600">Клиент оставил 5-звездочный отзыв</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
