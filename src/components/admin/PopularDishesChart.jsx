import { motion } from 'framer-motion';
import { PieChart, TrendingUp } from 'lucide-react';

const PopularDishesChart = ({ popularDishes, totalRevenue }) => {
  // Цвета для диаграммы
  const colors = [
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#06B6D4', // cyan-500
    '#84CC16', // lime-500
    '#F97316', // orange-500
    '#EC4899', // pink-500
    '#6366F1', // indigo-500
  ];

  // Рассчитываем углы для круговой диаграммы
  const calculateAngles = () => {
    const total = popularDishes.reduce((sum, dish) => sum + dish.revenue, 0);
    let currentAngle = 0;
    
    return popularDishes.map((dish, index) => {
      const percentage = (dish.revenue / total) * 100;
      const startAngle = currentAngle;
      const endAngle = currentAngle + (percentage / 100) * 360;
      currentAngle = endAngle;
      
      return {
        ...dish,
        percentage,
        startAngle,
        endAngle,
        color: colors[index % colors.length]
      };
    });
  };

  const dishesWithAngles = calculateAngles();

  // Функция для создания SVG path для сектора круга
  const createSectorPath = (startAngle, endAngle, radius = 60) => {
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = radius * Math.cos(startRad);
    const y1 = radius * Math.sin(startRad);
    const x2 = radius * Math.cos(endRad);
    const y2 = radius * Math.sin(endRad);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    
    return [
      `M 0 0`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <PieChart className="w-5 h-5 mr-2 text-primary-600" />
          Популярные блюда
        </h3>
        <div className="text-sm text-gray-500">
          Топ {popularDishes.length} блюд
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Круговая диаграмма */}
        <div className="flex justify-center">
          <div className="relative">
            <svg width="140" height="140" viewBox="-70 -70 140 140">
              {dishesWithAngles.map((dish, index) => (
                <motion.path
                  key={index}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ 
                    delay: index * 0.1, 
                    duration: 0.8,
                    ease: "easeInOut"
                  }}
                  d={createSectorPath(dish.startAngle, dish.endAngle)}
                  fill={dish.color}
                  stroke="white"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </svg>
            
            {/* Центральная информация */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {popularDishes.length}
                </div>
                <div className="text-xs text-gray-500">блюд</div>
              </div>
            </div>
          </div>
        </div>

        {/* Легенда и детали */}
        <div className="space-y-3">
          {dishesWithAngles.map((dish, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: dish.color }}
                ></div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    {dish.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {dish.count} заказов
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900 text-sm">
                  {dish.revenue.toLocaleString()} ₽
                </div>
                <div className="text-xs text-gray-500">
                  {dish.percentage.toFixed(1)}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Дополнительная статистика */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-primary-600">
              {popularDishes.reduce((sum, dish) => sum + dish.count, 0)}
            </div>
            <div className="text-xs text-gray-500">Всего заказов</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary-600">
              {popularDishes.reduce((sum, dish) => sum + dish.revenue, 0).toLocaleString()} ₽
            </div>
            <div className="text-xs text-gray-500">Общая выручка</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PopularDishesChart;