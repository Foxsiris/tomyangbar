import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const SBPCancel = () => {
  useEffect(() => {
    // Получаем параметры из URL
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('paymentId');
    const orderId = urlParams.get('orderId');
    
    if (paymentId) {
      console.log('SBP Payment Canceled:', { paymentId, orderId });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
      >
        {/* Иконка отмены */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6"
        >
          <XCircle className="w-12 h-12 text-red-600" />
        </motion.div>

        {/* Заголовок */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gray-900 mb-4"
        >
          Платеж отменен
        </motion.h1>

        {/* Описание */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-6"
        >
          Оплата через СБП была отменена. Ваш заказ сохранен, но не оплачен. Вы можете попробовать оплатить снова или выбрать другой способ оплаты.
        </motion.p>

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
              <span className="font-semibold text-red-600">СБП</span>
            </div>
            <div className="flex justify-between">
              <span>Статус:</span>
              <span className="font-semibold text-red-600">Отменен</span>
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
            to="/checkout"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Попробовать снова</span>
          </Link>
          
          <Link
            to="/cart"
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Вернуться к корзине</span>
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
          className="mt-6 p-4 bg-yellow-50 rounded-lg"
        >
          <h3 className="font-semibold text-yellow-900 mb-2">Что можно сделать?</h3>
          <ul className="text-sm text-yellow-800 space-y-1 text-left">
            <li>• Попробовать оплатить снова через СБП</li>
            <li>• Выбрать оплату банковской картой</li>
            <li>• Оплатить наличными при получении</li>
            <li>• Обратиться в поддержку</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SBPCancel;
