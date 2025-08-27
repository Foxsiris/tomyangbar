import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Clock,
  Star,
  BarChart3,
  PieChart
} from 'lucide-react';
import { 
  getOverallStats, 
  getPopularDishes, 
  getHourlyStats, 
  getCategoryStats, 
  getWeeklyStats 
} from '../../data/ordersData';

const AdminStats = () => {
  // Реальные данные из JSON файла
  const stats = getOverallStats();
  const popularDishes = getPopularDishes();
  const hourlyStats = getHourlyStats();
  const categoryStats = getCategoryStats();
  const weeklyTrends = getWeeklyStats();

  const maxRevenue = Math.max(...hourlyStats.map(stat => stat.revenue));
  const maxOrders = Math.max(...hourlyStats.map(stat => stat.orders));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Статистика и аналитика</h2>
        <p className="text-gray-600">Подробная аналитика работы ресторана</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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
            <span>+12% с прошлого месяца</span>
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
              <p className="text-sm font-medium text-gray-600">Всего заказов</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+8% с прошлого месяца</span>
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
              <p className="text-sm font-medium text-gray-600">Средний чек</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgOrderValue} ₽</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+5% с прошлого месяца</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Activity Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Активность по часам</h3>
          <div className="space-y-3">
            {hourlyStats.map((stat, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-12 text-sm text-gray-600">{stat.hour}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="h-6 bg-primary-600 rounded"
                      style={{ width: `${(stat.revenue / maxRevenue) * 100}%` }}
                    ></div>
                    <span className="text-sm font-medium">{stat.revenue} ₽</span>
                  </div>
                  <div className="text-xs text-gray-500">{stat.orders} заказов</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Popular Dishes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Популярные блюда</h3>
          <div className="space-y-4">
            {popularDishes.map((dish, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{dish.name}</div>
                  <div className="text-sm text-gray-500">{dish.count} заказов</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-primary-600">{dish.revenue.toLocaleString()} ₽</div>
                  <div className="text-sm text-gray-500">
                    {((dish.revenue / stats.totalRevenue) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика по категориям</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryStats.map((category, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{category.name}</h4>
                <span className="text-sm text-gray-500">{category.percentage}%</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Заказов:</span>
                  <span className="font-medium">{category.orders}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Выручка:</span>
                  <span className="font-medium">{category.revenue.toLocaleString()} ₽</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Weekly Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Тренды по дням недели</h3>
        <div className="grid grid-cols-7 gap-4">
          {weeklyTrends.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-sm font-medium text-gray-900 mb-2">{day.day}</div>
              <div className="bg-primary-100 rounded-lg p-3">
                <div className="text-lg font-bold text-primary-600">{day.orders}</div>
                <div className="text-xs text-gray-600">{day.revenue.toLocaleString()} ₽</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg shadow-lg p-6 text-center"
        >
          <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.customerRating}</div>
          <div className="text-sm text-gray-600">Рейтинг клиентов</div>
          <div className="flex justify-center mt-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${i < Math.floor(stats.customerRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-lg shadow-lg p-6 text-center"
        >
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.deliveryTime}</div>
          <div className="text-sm text-gray-600">Среднее время доставки (мин)</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-lg shadow-lg p-6 text-center"
        >
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.repeatCustomers}%</div>
          <div className="text-sm text-gray-600">Постоянные клиенты</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1 }}
          className="bg-white rounded-lg shadow-lg p-6 text-center"
        >
          <div className="text-3xl font-bold text-purple-600 mb-2">19:00</div>
          <div className="text-sm text-gray-600">Пиковое время</div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminStats;
