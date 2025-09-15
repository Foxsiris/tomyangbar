import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, QrCode, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const SBPModal = ({ 
  isOpen, 
  onClose, 
  orderData, 
  onPaymentSuccess, 
  onPaymentError 
}) => {
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, error, expired
  const [paymentId, setPaymentId] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [deepLink, setDeepLink] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Создание СБП платежа
  const handleCreateSBPayment = async () => {
    try {
      setPaymentStatus('processing');
      setErrorMessage('');

      // Формируем URL с параметрами заказа
      const returnUrl = `${window.location.origin}/payment/sbp/success?order_id=${orderData.orderId}`;
      const cancelUrl = `${window.location.origin}/payment/sbp/cancel?order_id=${orderData.orderId}`;

      const response = await fetch('/api/payment/sbp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          orderData,
          returnUrl,
          cancelUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Ошибка создания СБП платежа');
      }

      const result = await response.json();
      const payment = result.payment;
      
      setPaymentId(payment.id);
      setQrCode(payment.qrCode);
      setDeepLink(payment.deepLink);
      
      // Начинаем отслеживание статуса
      startStatusPolling(payment.id);
      
      // Устанавливаем таймер истечения (15 минут)
      setCountdown(15 * 60); // 15 минут в секундах
      
    } catch (error) {
      setPaymentStatus('error');
      setErrorMessage(error.message);
      onPaymentError?.(error);
    }
  };

  // Отслеживание статуса платежа
  const startStatusPolling = (paymentId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/sbp-status?paymentId=${paymentId}`);
        
        if (response.ok) {
          const result = await response.json();
          const payment = result.payment;
          
          if (payment.status === 'succeeded') {
            setPaymentStatus('success');
            clearInterval(pollInterval);
            onPaymentSuccess?.(paymentId);
          } else if (payment.status === 'failed' || payment.status === 'expired') {
            setPaymentStatus('error');
            setErrorMessage('Платеж не был выполнен');
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error('Ошибка проверки статуса СБП:', error);
      }
    }, 3000); // Проверяем каждые 3 секунды

    // Очищаем интервал через 15 минут
    setTimeout(() => {
      clearInterval(pollInterval);
      if (paymentStatus === 'processing') {
        setPaymentStatus('expired');
      }
    }, 15 * 60 * 1000);
  };

  // Таймер обратного отсчета
  useEffect(() => {
    if (countdown > 0 && paymentStatus === 'processing') {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && paymentStatus === 'processing') {
      setPaymentStatus('expired');
    }
  }, [countdown, paymentStatus]);

  // Отслеживаем изменения статуса платежа
  useEffect(() => {
    if (paymentStatus === 'success' && paymentId) {
      const timer = setTimeout(() => {
        onPaymentSuccess?.(paymentId);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [paymentStatus, paymentId, onPaymentSuccess]);

  // Обработка отмены платежа
  const handleCancelPayment = () => {
    setPaymentStatus('error');
    setErrorMessage('Платеж отменен пользователем');
  };

  // Отслеживаем отмену платежа
  useEffect(() => {
    if (paymentStatus === 'error' && errorMessage === 'Платеж отменен пользователем') {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [paymentStatus, errorMessage, onClose]);

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return <Clock className="w-6 h-6 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
      case 'expired':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Smartphone className="w-6 h-6 text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
      case 'expired':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'idle':
        return 'Готов к оплате через СБП';
      case 'processing':
        return 'Ожидание оплаты через СБП';
      case 'success':
        return 'Платеж успешно выполнен!';
      case 'error':
        return 'Ошибка платежа';
      case 'expired':
        return 'Время ожидания платежа истекло';
      default:
        return 'Обработка...';
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <h2 className="text-xl font-bold">Оплата через СБП</h2>
                <p className="text-green-100 text-sm">#{orderData.orderId}</p>
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
                  <span className="font-semibold text-green-600">СБП</span>
                </div>
              </div>
            </div>

            {/* QR код и статус */}
            {paymentStatus === 'processing' && qrCode && (
              <div className="text-center mb-6">
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                  <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">QR код для оплаты</p>
                  <div className="text-xs text-gray-500">
                    Отсканируйте QR код в приложении банка
                  </div>
                </div>
                
                {countdown > 0 && (
                  <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Время ожидания: {formatTime(countdown)}
                  </div>
                )}
              </div>
            )}

            {/* Статус платежа */}
            <div className="text-center mb-6">
              <div className={`text-lg font-semibold ${getStatusColor()} mb-2`}>
                {getStatusMessage()}
              </div>
              
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
                  onClick={handleCreateSBPayment}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Smartphone className="w-5 h-5" />
                  <span>Создать платеж СБП</span>
                </button>
              )}

              {paymentStatus === 'processing' && deepLink && (
                <div className="space-y-3">
                  <a
                    href={deepLink}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Smartphone className="w-5 h-5" />
                    <span>Открыть в приложении банка</span>
                  </a>
                  
                  <button
                    onClick={handleCancelPayment}
                    className="w-full bg-gray-500 text-white py-2 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  >
                    Отменить платеж
                  </button>
                </div>
              )}

              {(paymentStatus === 'success' || paymentStatus === 'error' || paymentStatus === 'expired') && (
                <button
                  onClick={onClose}
                  className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Закрыть
                </button>
              )}
            </div>

            {/* Инструкции */}
            {paymentStatus === 'processing' && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Как оплатить:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Откройте приложение вашего банка</li>
                  <li>2. Найдите раздел "СБП" или "Быстрые платежи"</li>
                  <li>3. Отсканируйте QR код или нажмите кнопку выше</li>
                  <li>4. Подтвердите платеж</li>
                </ol>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SBPModal;
