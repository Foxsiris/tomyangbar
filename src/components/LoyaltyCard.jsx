import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Star, TrendingUp, Award, ChevronRight, Coins } from 'lucide-react';

const LOYALTY_LEVELS = {
  bronze: {
    name: 'Бронзовый',
    emoji: '🥉',
    color: 'from-amber-600 to-amber-800',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    cashback: 2,
    minSpent: 0
  },
  silver: {
    name: 'Серебряный',
    emoji: '🥈',
    color: 'from-gray-400 to-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-700',
    cashback: 3,
    minSpent: 80000
  },
  gold: {
    name: 'Золотой',
    emoji: '🥇',
    color: 'from-yellow-400 to-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    textColor: 'text-yellow-800',
    cashback: 5,
    minSpent: 100000
  }
};

const LoyaltyCard = ({ user, onViewHistory }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Данные лояльности из пользователя
  const bonusBalance = user?.bonus_balance || user?.loyaltyInfo?.bonusBalance || 0;
  const totalSpent = parseFloat(user?.total_spent || user?.loyaltyInfo?.totalSpent || 0);
  const loyaltyLevel = user?.loyalty_level || user?.loyaltyInfo?.level || 'bronze';
  
  const levelInfo = LOYALTY_LEVELS[loyaltyLevel] || LOYALTY_LEVELS.bronze;
  
  // Расчет прогресса до следующего уровня
  const getProgressInfo = () => {
    if (loyaltyLevel === 'gold') {
      return { 
        hasNext: false, 
        progress: 100, 
        remaining: 0,
        nextLevel: null 
      };
    }
    
    if (loyaltyLevel === 'silver') {
      const target = LOYALTY_LEVELS.gold.minSpent;
      const progress = Math.min((totalSpent / target) * 100, 100);
      return {
        hasNext: true,
        progress,
        remaining: target - totalSpent,
        nextLevel: LOYALTY_LEVELS.gold
      };
    }
    
    // bronze
    const target = LOYALTY_LEVELS.silver.minSpent;
    const progress = Math.min((totalSpent / target) * 100, 100);
    return {
      hasNext: true,
      progress,
      remaining: target - totalSpent,
      nextLevel: LOYALTY_LEVELS.silver
    };
  };
  
  const progressInfo = getProgressInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
    >
      {/* Header с уровнем */}
      <div className={`bg-gradient-to-r ${levelInfo.color} p-6 text-white relative overflow-hidden`}>
        {/* Декоративные элементы */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{levelInfo.emoji}</span>
              <div>
                <h3 className="text-xl font-bold">{levelInfo.name} уровень</h3>
                <p className="text-white/80 text-sm">Кэшбэк {levelInfo.cashback}% с каждого заказа</p>
              </div>
            </div>
            <Award className="w-12 h-12 opacity-50" />
          </div>
          
          {/* Баланс бонусов */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Ваши бонусы</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{bonusBalance.toLocaleString()}</span>
                  <span className="text-white/80">₽</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Coins className="w-5 h-5" />
                <span className="text-sm font-medium">1 бонус = 1 ₽</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Прогресс до следующего уровня */}
      <div className="p-6">
        {progressInfo.hasNext ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Прогресс до {progressInfo.nextLevel.emoji} {progressInfo.nextLevel.name}</span>
              <span className="text-gray-900 font-medium">{Math.round(progressInfo.progress)}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressInfo.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${progressInfo.nextLevel.color} rounded-full`}
              />
            </div>
            <p className="text-gray-500 text-sm mt-2">
              Осталось потратить <span className="font-semibold text-gray-900">{progressInfo.remaining.toLocaleString()} ₽</span> для повышения уровня
            </p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-800">Максимальный уровень достигнут!</p>
                <p className="text-yellow-700 text-sm">Вы получаете максимальный кэшбэк 5%</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Статистика */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-green-800 text-sm font-medium">Всего покупок</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{totalSpent.toLocaleString()} ₽</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-purple-600" />
              <span className="text-purple-800 text-sm font-medium">Кэшбэк</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{levelInfo.cashback}%</p>
          </motion.div>
        </div>
        
        {/* Кнопка истории */}
        {onViewHistory && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onViewHistory}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <span className="font-medium text-gray-700">История бонусов</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </motion.button>
        )}
        
        {/* Информация о системе */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
          className="overflow-hidden"
        >
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h4 className="font-semibold text-blue-900 mb-3">Как работает система лояльности</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>За каждый заказ начисляются бонусы ({levelInfo.cashback}% от суммы)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>1 бонус = 1 рубль при оплате</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Бонусами можно оплатить до 100% заказа</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Чем больше покупок — тем выше уровень и кэшбэк</span>
              </li>
            </ul>
            
            <div className="mt-4 pt-4 border-t border-blue-200">
              <h5 className="font-medium text-blue-900 mb-2">Уровни:</h5>
              <div className="space-y-1 text-sm">
                <p>🥉 <strong>Бронзовый</strong> — старт, 2% кэшбэк</p>
                <p>🥈 <strong>Серебряный</strong> — от 80 000 ₽, 3% кэшбэк</p>
                <p>🥇 <strong>Золотой</strong> — от 100 000 ₽, 5% кэшбэк</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {isExpanded ? 'Скрыть информацию' : 'Подробнее о программе лояльности'}
        </button>
      </div>
    </motion.div>
  );
};

export default LoyaltyCard;
