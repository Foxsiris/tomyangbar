import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const SBPSuccess = () => {
  const [orderId, setOrderId] = useState(null);
  
  useEffect(() => {
    // Получаем параметры из URL
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('paymentId');
    const orderIdParam = urlParams.get('orderId') || urlParams.get('order_id');
    
    if (orderIdParam) {
      setOrderId(orderIdParam);
    }
    
    if (paymentId) {
      console.log('SBP Payment Success:', { paymentId, orderId: orderIdParam });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
      >
        {/* Иконка успеха */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle className="w-12 h-12 text-green-600" />
        </motion.div>

        {/* Заголовок */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gray-900 mb-4"
        >
          Платеж успешно выполнен!
        </motion.h1>

        {/* Описание */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-6"
        >
          Ваш заказ оплачен через СБП. Мы получили уведомление о платеже и начнем готовить ваш заказ.
        </motion.p>

        {/* Номер заказа */}
        {orderId && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-blue-600 font-semibold">Номер заказа:</span>
              <span className="text-2xl font-bold text-blue-800">
                {orderId.length > 10 ? `#${orderId.slice(-6)}` : `#${orderId}`}
              </span>
            </div>
          </motion.div>
        )}

        {/* Детали */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-50 rounded-lg p-4 mb-6"
        >
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex justify-between">
              <span>Способ оплаты:</span>
              <span className="font-semibold text-green-600">СБП</span>
            </div>
            <div className="flex justify-between">
              <span>Статус:</span>
              <span className="font-semibold text-green-600">Оплачено</span>
            </div>
            <div className="flex justify-between">
              <span>Время:</span>
              <span>{new Date().toLocaleString('ru-RU')}</span>
            </div>
          </div>
        </motion.div>

        {/* Кнопки */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <Link
            to="/profile"
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Мои заказы</span>
          </Link>
          
          <Link
            to="/"
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>На главную</span>
          </Link>
        </motion.div>

        {/* Дополнительная информация */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 p-4 bg-blue-50 rounded-lg"
        >
          <h3 className="font-semibold text-blue-900 mb-2">Что дальше?</h3>
          <ul className="text-sm text-blue-800 space-y-1 text-left">
            <li>• Мы получили ваш заказ и начали готовить</li>
            <li>• Вы получите SMS с номером заказа</li>
            <li>• Время доставки зависит от загруженности</li>
            <li>• Следите за статусом в личном кабинете</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SBPSuccess;
