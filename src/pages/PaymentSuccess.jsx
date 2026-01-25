import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft, Home, XCircle, AlertCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { useCartContext } from '../context/CartContext';
import { OrderService } from '../services/orderService';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState('loading');
  const [paymentData, setPaymentData] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { clearCart } = useCartContext();
  const processedRef = useRef(false);
  
  // Пробуем получить payment_id из URL или из localStorage
  const urlPaymentId = searchParams.get('payment_id');
  const storedPaymentId = localStorage.getItem('pending_payment_id');
  const paymentId = urlPaymentId || storedPaymentId;

  useEffect(() => {
    // Предотвращаем повторную обработку
    if (processedRef.current) return;
    
    const processPayment = async () => {
      processedRef.current = true;
      
      try {
        // Получаем сохранённые данные заказа
        const savedOrderData = localStorage.getItem('pending_order_data');
        
        if (!savedOrderData) {
          console.log('No pending order data found');
          setPaymentStatus('error');
          setErrorMessage('Данные заказа не найдены. Возможно, заказ уже был создан ранее.');
          return;
        }
        
        const orderData = JSON.parse(savedOrderData);
        console.log('Found pending order data:', orderData);
        console.log('Payment ID sources - URL:', urlPaymentId, 'LocalStorage:', storedPaymentId);
        
        // Проверяем статус платежа
        if (paymentId) {
          console.log('Checking payment status for:', paymentId);
          
          const response = await apiClient.get(`/api/payment/status/${paymentId}`);
          console.log('Payment status response:', response);
          
          setPaymentData(response.payment);
          
          if (response.payment?.paid && response.payment?.status === 'succeeded') {
            // Платёж успешен - создаём заказ
            console.log('Payment successful, creating order...');
            
            try {
              // Создаём заказ
              const newOrder = await OrderService.createOrder({
                ...orderData,
                paymentId: paymentId,
                paymentStatus: 'paid'
              }, orderData.userId);
              
              console.log('Order created:', newOrder);
              setOrderNumber(newOrder.order_number || newOrder.id);
              setPaymentStatus('success');
              
              // Очищаем данные
              localStorage.removeItem('pending_order_data');
              localStorage.removeItem('pending_payment_id');
              clearCart();
              
            } catch (orderError) {
              console.error('Error creating order:', orderError);
              setPaymentStatus('error');
              setErrorMessage('Оплата прошла, но произошла ошибка при создании заказа. Свяжитесь с нами.');
            }
          } else {
            // Платёж не успешен
            console.log('Payment not successful:', response.payment?.status);
            setPaymentStatus('failed');
            localStorage.removeItem('pending_payment_id');
          }
        } else {
          // Нет payment_id - возможно редирект без параметров
          // Проверяем, был ли это просто возврат без оплаты
          console.log('No payment_id found (URL or localStorage)');
          setPaymentStatus('failed');
          setErrorMessage('Платёж не был завершён. Payment ID не найден.');
          localStorage.removeItem('pending_payment_id');
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        setPaymentStatus('error');
        setErrorMessage(error.message || 'Произошла ошибка при обработке платежа');
      }
    };
    
    processPayment();
  }, [paymentId, clearCart]);

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
            <h1 className="text-2xl font-bold text-gray-800">Обработка платежа...</h1>
            <p className="text-gray-600">Пожалуйста, подождите. Создаём ваш заказ.</p>
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
                Ваш заказ успешно создан и оплачен
              </p>
              
              {/* Номер заказа */}
              {orderNumber && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-blue-600 font-semibold">Номер заказа:</span>
                    <span className="text-2xl font-bold text-blue-800">
                      #{orderNumber}
                    </span>
                  </div>
                </div>
              )}
              
              {paymentData && (
                <div className="bg-green-50 rounded-lg p-4 text-sm">
                  <p className="text-green-800">
                    Сумма: {paymentData.amount?.value} ₽
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
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-red-600 mb-2">Платеж не выполнен</h1>
              <p className="text-gray-600 mb-4">
                {errorMessage || 'К сожалению, платеж не был завершен. Заказ не создан.'}
              </p>
            </div>

            <div className="space-y-3">
              <Link
                to="/checkout"
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Вернуться к оформлению</span>
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
              <AlertCircle className="w-12 h-12 text-yellow-600" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-yellow-600 mb-2">Ошибка</h1>
              <p className="text-gray-600 mb-4">
                {errorMessage || 'Произошла ошибка при обработке платежа'}
              </p>
              <p className="text-sm text-gray-500">
                Если деньги были списаны, свяжитесь с нами по телефону
              </p>
            </div>

            <div className="space-y-3">
              <Link
                to="/checkout"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Вернуться к оформлению</span>
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
