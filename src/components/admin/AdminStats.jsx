// import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
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
import { OrderService } from '../../services/orderService';
import PopularDishesChart from './PopularDishesChart';
import HourlyActivityChart from './HourlyActivityChart';

const AdminStats = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    activeOrders: 0,
    completedOrders: 0,
    customerRating: 4.8,
    deliveryTime: 45,
    repeatCustomers: 68
  });

  // Ref для предотвращения дублирующих запросов
  const loadingRef = useRef(false);

  // Загружаем данные из Supabase
  useEffect(() => {
    const loadStatsData = async () => {
      // Предотвращаем дублирующие запросы
      if (loadingRef.current) {
        return;
      }

      // Проверяем, что токен авторизации есть
      const token = localStorage.getItem('tomyangbar_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        loadingRef.current = true;
        setLoading(true);
        const ordersData = await OrderService.getAllOrders();
        
        setOrders(ordersData);
        
        // Вычисляем статистику
        const totalOrders = ordersData.length;
        const totalRevenue = ordersData.reduce((sum, order) => sum + (order.final_total || 0), 0);
        const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
        const activeOrders = ordersData.filter(order => 
          ['pending', 'preparing', 'delivering'].includes(order.status)
        ).length;
        const completedOrders = ordersData.filter(order => order.status === 'completed').length;
        
        setStats({
          totalOrders,
          totalRevenue,
          avgOrderValue,
          activeOrders,
          completedOrders,
          customerRating: 4.8,
          deliveryTime: 45,
          repeatCustomers: 68
        });
      } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    };

    loadStatsData();
    
    // Cleanup функция для предотвращения утечек памяти
    return () => {
      loadingRef.current = false;
    };
  }, []);

  // Функции для расчета данных графиков
  const getHourlyStats = () => {
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourOrders = orders.filter(order => {
        const orderHour = new Date(order.created_at).getHours();
        return orderHour === hour;
      });
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        orders: hourOrders.length,
        revenue: hourOrders.reduce((sum, order) => sum + (order.final_total || 0), 0)
      };
    });
    return hourlyData;
  };

  const getPopularDishes = () => {
    const dishCounts = {};
    orders.forEach(order => {
      if (order.order_items) {
        order.order_items.forEach(item => {
          const dishName = item.dish_name || 'Неизвестное блюдо';
          if (dishCounts[dishName]) {
            dishCounts[dishName].count += item.quantity;
            dishCounts[dishName].revenue += item.price * item.quantity;
          } else {
            dishCounts[dishName] = {
              count: item.quantity,
              revenue: item.price * item.quantity
            };
          }
        });
      }
    });
    
    return Object.entries(dishCounts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const getCategoryStats = () => {
    const categoryCounts = {};
    orders.forEach(order => {
      if (order.order_items) {
        order.order_items.forEach(item => {
          // Определяем категорию по ID блюда (как в оригинальной версии)
          let category = 'Другое';
          const dishId = item.dish_id;
          
          if ([1, 2, 12, 13].includes(dishId)) category = 'Стартеры';
          else if ([3, 4, 5, 6, 25, 26].includes(dishId)) category = 'Роллы';
          else if ([14, 15, 16].includes(dishId)) category = 'Супы';
          else if ([17, 18].includes(dishId)) category = 'Горячие блюда';
          else if ([19, 20].includes(dishId)) category = 'Салаты';
          else if ([21, 22].includes(dishId)) category = 'Вок';
          else if ([23, 24].includes(dishId)) category = 'Закуски фрай';
          else if ([27, 28, 11].includes(dishId)) category = 'Напитки';
          else if ([9, 10].includes(dishId)) category = 'Десерты';
          
          if (categoryCounts[category]) {
            categoryCounts[category].orders += item.quantity;
            categoryCounts[category].revenue += item.price * item.quantity;
          } else {
            categoryCounts[category] = { 
              orders: item.quantity, 
              revenue: item.price * item.quantity 
            };
          }
        });
      }
    });
    
    const totalRevenue = Object.values(categoryCounts).reduce((sum, data) => sum + data.revenue, 0);
    
    return Object.entries(categoryCounts).map(([name, data]) => ({
      name,
      orders: data.orders,
      revenue: data.revenue,
      percentage: totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 100) : 0
    }));
  };

  const getWeeklyStats = () => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const weeklyData = days.map(day => {
      const dayOrders = orders.filter(order => {
        const orderDay = new Date(order.created_at).getDay();
        const dayIndex = day === 'Вс' ? 0 : day === 'Пн' ? 1 : day === 'Вт' ? 2 : 
                        day === 'Ср' ? 3 : day === 'Чт' ? 4 : day === 'Пт' ? 5 : 6;
        return orderDay === dayIndex;
      });
      return {
        day,
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + (order.final_total || 0), 0)
      };
    });
    return weeklyData;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Загрузка статистики...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Статистика и аналитика</h2>
        <p className="text-gray-600">Подробная аналитика работы ресторана</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
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
        </div>

        <div
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
        </div>

        <div
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
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Activity Chart */}
        <HourlyActivityChart hourlyStats={getHourlyStats()} />

        {/* Popular Dishes Chart */}
        <PopularDishesChart popularDishes={getPopularDishes()} totalRevenue={stats.totalRevenue} />
      </div>

      {/* Category Breakdown */}
      <div
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика по категориям</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getCategoryStats().length > 0 ? (
            getCategoryStats().map((category, index) => {
              const colors = [
                { name: 'Стартеры', color: 'bg-blue-500' },
                { name: 'Роллы', color: 'bg-red-500' },
                { name: 'Супы', color: 'bg-orange-500' },
                { name: 'Горячие блюда', color: 'bg-purple-500' },
                { name: 'Салаты', color: 'bg-green-500' },
                { name: 'Вок', color: 'bg-yellow-500' },
                { name: 'Закуски фрай', color: 'bg-pink-500' },
                { name: 'Напитки', color: 'bg-cyan-500' },
                { name: 'Десерты', color: 'bg-indigo-500' }
              ];
              
              // Находим цвет для категории или используем дефолтный
              const categoryColor = colors.find(c => c.name === category.name) || colors[index % colors.length];
              
              return (
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
                        className={`${categoryColor.color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center text-gray-500 py-8">
              <p>Нет данных по категориям</p>
              <p className="text-sm">Статистика появится после первых заказов</p>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Trends */}
      <div
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Тренды по дням недели</h3>
        <div className="grid grid-cols-7 gap-4">
          {getWeeklyStats().map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-sm font-medium text-gray-900 mb-2">{day.day}</div>
              <div className="bg-primary-100 rounded-lg p-3">
                <div className="text-lg font-bold text-primary-600">{day.orders}</div>
                <div className="text-xs text-gray-600">{day.revenue.toLocaleString()} ₽</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
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
        </div>

        <div
          className="bg-white rounded-lg shadow-lg p-6 text-center"
        >
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.deliveryTime}</div>
          <div className="text-sm text-gray-600">Среднее время доставки (мин)</div>
        </div>

        <div
          className="bg-white rounded-lg shadow-lg p-6 text-center"
        >
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.repeatCustomers}%</div>
          <div className="text-sm text-gray-600">Постоянные клиенты</div>
        </div>

        <div
          className="bg-white rounded-lg shadow-lg p-6 text-center"
        >
          <div className="text-3xl font-bold text-purple-600 mb-2">19:00</div>
          <div className="text-sm text-gray-600">Пиковое время</div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;