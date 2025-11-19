import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock } from 'lucide-react';

const HourlyActivityChart = ({ hourlyStats }) => {
  const maxRevenue = Math.max(...hourlyStats.map(stat => stat.revenue));
  const maxOrders = Math.max(...hourlyStats.map(stat => stat.orders));

  // Функция для создания SVG path для линии графика
  const createLinePath = (data, key, width, height, padding = 20) => {
    const maxValue = Math.max(...data.map(item => item[key]));
    const stepX = (width - padding * 2) / (data.length - 1);
    const stepY = (height - padding * 2) / maxValue;
    
    const points = data.map((item, index) => {
      const x = padding + index * stepX;
      const y = height - padding - (item[key] * stepY);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  // Функция для создания области под графиком
  const createAreaPath = (data, key, width, height, padding = 20) => {
    const maxValue = Math.max(...data.map(item => item[key]));
    const stepX = (width - padding * 2) / (data.length - 1);
    const stepY = (height - padding * 2) / maxValue;
    
    const points = data.map((item, index) => {
      const x = padding + index * stepX;
      const y = height - padding - (item[key] * stepY);
      return `${x},${y}`;
    });
    
    const bottomPoints = data.map((item, index) => {
      const x = padding + index * stepX;
      const y = height - padding;
      return `${x},${y}`;
    }).reverse();
    
    return `M ${points.join(' L ')} L ${bottomPoints.join(' L ')} Z`;
  };

  const chartWidth = 400;
  const chartHeight = 200;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-primary-600" />
          Активность по часам
        </h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
            <span className="text-gray-600">Выручка</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-gray-600">Заказы</span>
          </div>
        </div>
      </div>

      {/* График */}
      <div className="relative">
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          {/* Сетка */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i}>
              <line
                x1={chartWidth / 6 * i}
                y1="0"
                x2={chartWidth / 6 * i}
                y2={chartHeight}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <line
                x1="0"
                y1={chartHeight / 4 * i}
                x2={chartWidth}
                y2={chartHeight / 4 * i}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            </g>
          ))}

          {/* Область под графиком выручки */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            d={createAreaPath(hourlyStats, 'revenue', chartWidth, chartHeight)}
            fill="url(#revenueGradient)"
            opacity="0.3"
          />

          {/* Линия выручки */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
            d={createLinePath(hourlyStats, 'revenue', chartWidth, chartHeight)}
            stroke="url(#revenueGradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Точки на графике */}
          {hourlyStats.map((stat, index) => {
            const maxValue = Math.max(...hourlyStats.map(item => item.revenue));
            const stepX = (chartWidth - 40) / (hourlyStats.length - 1);
            const stepY = (chartHeight - 40) / maxValue;
            const x = 20 + index * stepX;
            const y = chartHeight - 20 - (stat.revenue * stepY);

            return (
              <motion.circle
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
                cx={x}
                cy={y}
                r="4"
                fill="white"
                stroke="#3B82F6"
                strokeWidth="2"
                className="cursor-pointer hover:r-6 transition-all"
              />
            );
          })}

          {/* Градиенты */}
          <defs>
            <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="1" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>

        {/* Подписи осей */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          {hourlyStats.filter((_, index) => index % 3 === 0).map((stat, index) => (
            <span key={index}>{stat.hour}</span>
          ))}
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-lg font-bold text-primary-600">
            {hourlyStats.reduce((sum, stat) => sum + stat.orders, 0)}
          </div>
          <div className="text-xs text-gray-500">Всего заказов</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-primary-600">
            {hourlyStats.reduce((sum, stat) => sum + stat.revenue, 0).toLocaleString()} ₽
          </div>
          <div className="text-xs text-gray-500">Общая выручка</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-primary-600">
            {hourlyStats.find(stat => stat.revenue === maxRevenue)?.hour || '00:00'}
          </div>
          <div className="text-xs text-gray-500">Пик активности</div>
        </div>
      </div>

      {/* Топ часы */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          Самые активные часы
        </h4>
        <div className="flex space-x-2">
          {hourlyStats
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 3)
            .map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5 + index * 0.1 }}
                className="flex-1 bg-primary-50 rounded-lg p-2 text-center"
              >
                <div className="text-sm font-medium text-primary-700">{stat.hour}</div>
                <div className="text-xs text-primary-600">{stat.revenue} ₽</div>
              </motion.div>
            ))}
        </div>
      </div>
    </motion.div>
  );
};

export default HourlyActivityChart;