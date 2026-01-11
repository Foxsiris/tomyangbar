import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, CreditCard, UserPlus, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { UserService } from '../services/userService';

const TRANSACTION_TYPES = {
  registration: {
    icon: UserPlus,
    label: 'Регистрация',
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  order_cashback: {
    icon: Gift,
    label: 'Кэшбэк',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  order_payment: {
    icon: CreditCard,
    label: 'Оплата',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  admin_adjustment: {
    icon: RefreshCw,
    label: 'Корректировка',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  expiration: {
    icon: TrendingDown,
    label: 'Сгорание',
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  }
};

const BonusHistoryModal = ({ isOpen, onClose, userId }) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadTransactions();
    }
  }, [isOpen, userId]);

  const loadTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await UserService.getBonusHistory(userId);
      setTransactions(data || []);
    } catch (err) {
      console.error('Error loading bonus history:', err);
      setError('Не удалось загрузить историю бонусов');
    } finally {
      setIsLoading(false);
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

  const getTransactionInfo = (type) => {
    return TRANSACTION_TYPES[type] || TRANSACTION_TYPES.admin_adjustment;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">История бонусов</h2>
                  <p className="text-white/80 text-sm">Все операции с бонусами</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[60vh] p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={loadTransactions}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Попробовать снова
                </button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">История пуста</p>
                <p className="text-gray-400 text-sm mt-2">
                  Здесь будут отображаться все операции с бонусами
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction, index) => {
                  const info = getTransactionInfo(transaction.type);
                  const Icon = info.icon;
                  const isPositive = transaction.amount > 0;

                  return (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className={`p-3 rounded-full ${info.bgColor}`}>
                        <Icon className={`w-5 h-5 ${info.color}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{info.label}</span>
                          {isPositive ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <p className="text-gray-500 text-sm truncate">
                          {transaction.description}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{transaction.amount}
                        </p>
                        <p className="text-gray-400 text-xs">
                          Баланс: {transaction.balance_after}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BonusHistoryModal;
