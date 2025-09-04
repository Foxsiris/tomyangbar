import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const PaymentCancel = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        <div className="space-y-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-12 h-12 text-yellow-600" />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-yellow-600 mb-2">Платеж отменен</h1>
            <p className="text-gray-600 mb-4">
              Вы отменили процесс оплаты. Ваш заказ сохранен и ожидает оплаты.
            </p>
            <p className="text-sm text-gray-500">
              Вы можете вернуться к оформлению заказа в любое время
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/checkout"
              className="w-full bg-yellow-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Вернуться к оплате</span>
            </Link>
            
            <Link
              to="/cart"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Корзина</span>
            </Link>
            
            <Link
              to="/"
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>На главную</span>
            </Link>
          </div>

          <div className="text-xs text-gray-500">
            <p>Если у вас возникли проблемы с оплатой,</p>
            <p>свяжитесь с нами по телефону: +7 (999) 123-45-67</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;
