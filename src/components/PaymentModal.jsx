import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Loader, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { createPayment, checkPaymentStatus, cancelPayment } from '../config/payment';

const PaymentModal = ({ isOpen, onClose, orderData, onPaymentSuccess, onPaymentError }) => {
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, error, canceled
  const [paymentId, setPaymentId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Блокируем скролл body при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setPaymentStatus('idle');
      setPaymentId(null);
      setErrorMessage('');
      setCountdown(0);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Обработка создания платежа
  const handleCreatePayment = async () => {
    try {
      setPaymentStatus('processing');
      setErrorMessage('');

      console.log('Creating payment with orderData:', orderData);
      const payment = await createPayment(orderData);
      
      console.log('Payment received in modal (full object):', JSON.stringify(payment, null, 2));
      
      // Проверяем, что payment существует
      if (!payment) {
        console.error('Payment is null or undefined');
        throw new Error('Не получен ответ от сервера платежей');
      }
      
      // Проверяем наличие ID
      if (!payment.id) {
        console.error('Payment response without ID:', payment);
        throw new Error('Некорректный ответ от сервера платежей: отсутствует ID платежа');
      }
      
      setPaymentId(payment.id);

      // Ищем confirmation URL в разных возможных местах
      const confirmationUrl = payment.confirmation?.confirmation_url || 
                             payment.confirmation_url ||
                             payment.confirmation?.redirect_url ||
                             payment.redirect_url;

      console.log('Looking for confirmation URL:', {
        'payment.confirmation?.confirmation_url': payment.confirmation?.confirmation_url,
        'payment.confirmation_url': payment.confirmation_url,
        'found': confirmationUrl
      });

      // Проверяем, есть ли URL для редиректа
      if (confirmationUrl) {
        console.log('Redirecting to payment page:', confirmationUrl);
        
        // Сохраняем payment_id в localStorage для использования после возврата
        localStorage.setItem('pending_payment_id', payment.id);
        console.log('Saved pending_payment_id:', payment.id);
        
        // Небольшая задержка для показа статуса "обработка"
        setTimeout(() => {
          try {
            // Реальный редирект на страницу оплаты YooKassa
            window.location.href = confirmationUrl;
          } catch (redirectError) {
            console.error('Redirect error:', redirectError);
            // Если window.location.href не сработал, пробуем replace
            window.location.replace(confirmationUrl);
          }
        }, 500);
      } else {
        console.error('No confirmation URL found. Payment object:', JSON.stringify(payment, null, 2));
        throw new Error('URL для оплаты не получен от сервера. Пожалуйста, попробуйте еще раз.');
      }

    } catch (error) {
      console.error('Payment creation error in modal:', error);
      console.error('Error stack:', error.stack);
      setPaymentStatus('error');
      setErrorMessage(error.message || 'Произошла ошибка при создании платежа');
      onPaymentError?.(error);
    }
  };

  // Симуляция процесса оплаты
  const simulatePaymentProcess = (paymentId) => {
    setCountdown(10);
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Симулируем успешную оплату
          setPaymentStatus('success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Отслеживаем изменения статуса платежа
  useEffect(() => {
    if (paymentStatus === 'success' && paymentId) {
      // Используем setTimeout для вызова callback'а после завершения рендеринга
      const timer = setTimeout(() => {
        onPaymentSuccess?.(paymentId);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, paymentId, onPaymentSuccess]);

  // Обработка отмены платежа
  const handleCancelPayment = async () => {
    if (paymentId) {
      try {
        await cancelPayment(paymentId);
      } catch (error) {
        console.error('Ошибка при отмене платежа:', error);
      }
    }
    
    setPaymentStatus('canceled');
  };

  // Отслеживаем отмену платежа
  useEffect(() => {
    if (paymentStatus === 'canceled') {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, onClose]);

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return <Loader className="w-8 h-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-red-500" />;
      case 'canceled':
        return <AlertCircle className="w-8 h-8 text-yellow-500" />;
      default:
        return <CreditCard className="w-8 h-8 text-blue-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'Обработка платежа...';
      case 'success':
        return 'Платеж успешно выполнен!';
      case 'error':
        return 'Ошибка при обработке платежа';
      case 'canceled':
        return 'Платеж отменен';
      default:
        return 'Готов к оплате';
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'canceled':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <h2 className="text-xl font-bold">Онлайн-платеж</h2>
                <p className="text-blue-100 text-sm">#{orderData.orderId}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Информация о заказе */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Детали заказа</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Сумма:</span>
                  <span className="font-semibold">{orderData.total} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span>Клиент:</span>
                  <span>{orderData.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Телефон:</span>
                  <span>{orderData.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Способ оплаты:</span>
                  <span className="font-semibold">Умный платеж YooKassa</span>
                </div>
              </div>
            </div>

            {/* Информация о Smart Payment */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">Умный платеж YooKassa</h4>
              <p className="text-sm text-blue-800">
                На странице оплаты вы сможете выбрать удобный способ: банковскую карту, СБП, ЮMoney, SberPay и другие доступные методы оплаты.
              </p>
            </div>

            {/* Статус платежа */}
            <div className="text-center mb-6">
              <div className={`text-lg font-semibold ${getStatusColor()} mb-2`}>
                {getStatusMessage()}
              </div>
              
              {paymentStatus === 'processing' && countdown > 0 && (
                <div className="text-sm text-gray-500">
                  Перенаправление через {countdown} сек...
                </div>
              )}
              
              {errorMessage && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mt-3">
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Кнопки действий */}
            <div className="space-y-3">
              {paymentStatus === 'idle' && (
                <button
                  onClick={handleCreatePayment}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Перейти к оплате</span>
                </button>
              )}
              
              {paymentStatus === 'processing' && (
                <button
                  onClick={handleCancelPayment}
                  className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Отменить платеж
                </button>
              )}
              
              {paymentStatus === 'success' && (
                <button
                  onClick={onClose}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Закрыть
                </button>
              )}
              
              {paymentStatus === 'error' && (
                <div className="space-y-2">
                  <button
                    onClick={handleCreatePayment}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Попробовать снова
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Отменить
                  </button>
                </div>
              )}
              
              {paymentStatus === 'canceled' && (
                <button
                  onClick={onClose}
                  className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Закрыть
                </button>
              )}
            </div>

            {/* Информация о безопасности */}
            <div className="mt-6 text-xs text-gray-500 text-center">
              <p>Оплата защищена SSL-шифрованием</p>
              <p>Мы не храним данные вашей карты</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentModal;
