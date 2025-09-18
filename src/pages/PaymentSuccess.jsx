import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft, Home } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { checkPaymentStatus } from '../config/payment';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState('loading');
  const [paymentData, setPaymentData] = useState(null);
  
  const paymentId = searchParams.get('payment_id');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (paymentId) {
      checkPaymentStatus(paymentId)
        .then(status => {
          setPaymentData(status);
          setPaymentStatus(status.paid ? 'success' : 'failed');
        })
        .catch(error => {
          console.error('Ошибка при проверке статуса платежа:', error);
          setPaymentStatus('error');
        });
    } else {
      setPaymentStatus('success'); // Если нет payment_id, считаем успешным
    }
  }, [paymentId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        {paymentStatus === 'loading' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Проверка платежа...</h1>
            <p className="text-gray-600">Пожалуйста, подождите</p>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-green-600 mb-2">Оплата успешна!</h1>
              <p className="text-gray-600 mb-4">
                Ваш заказ успешно оплачен
              </p>
              
              {/* Номер заказа */}
              {orderId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-blue-600 font-semibold">Номер заказа:</span>
                    <span className="text-2xl font-bold text-blue-800">
                      {orderId.length > 10 ? `#${orderId.slice(-6)}` : `#${orderId}`}
                    </span>
                  </div>
                </div>
              )}
              
              {paymentData && (
                <div className="bg-green-50 rounded-lg p-4 text-sm">
                  <p className="text-green-800">
                    Сумма: {paymentData.amount?.value} {paymentData.amount?.currency}
                  </p>
                  <p className="text-green-600">
                    ID платежа: {paymentData.id}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Link
                to="/profile"
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Мои заказы</span>
              </Link>
              
              <Link
                to="/"
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>На главную</span>
              </Link>
            </div>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-red-600" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-red-600 mb-2">Платеж не выполнен</h1>
              <p className="text-gray-600 mb-4">
                К сожалению, платеж не был завершен
              </p>
            </div>

            <div className="space-y-3">
              <Link
                to="/checkout"
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Попробовать снова</span>
              </Link>
              
              <Link
                to="/"
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>На главную</span>
              </Link>
            </div>
          </div>
        )}

        {paymentStatus === 'error' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-yellow-600" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-yellow-600 mb-2">Ошибка</h1>
              <p className="text-gray-600 mb-4">
                Произошла ошибка при проверке платежа
              </p>
            </div>

            <div className="space-y-3">
              <Link
                to="/profile"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Мои заказы</span>
              </Link>
              
              <Link
                to="/"
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>На главную</span>
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
