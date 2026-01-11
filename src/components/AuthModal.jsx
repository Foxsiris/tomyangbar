/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, User, MessageSquare, ArrowLeft, Gift, Loader2 } from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { applyPhoneMask, validateRussianPhone } from '../utils/phoneMask';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  // Блокируем скролл body при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Шаги: 'phone' -> 'code' -> 'name' (для новых пользователей)
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(['', '', '', '']);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);
  const [devCode, setDevCode] = useState(null); // Для режима разработки
  
  const codeInputRefs = useRef([]);

  // Таймер обратного отсчета для повторной отправки
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Сброс при закрытии
  useEffect(() => {
    if (!isOpen) {
      setStep('phone');
      setPhone('');
      setCode(['', '', '', '']);
      setName('');
      setError('');
      setIsNewUser(false);
      setDevCode(null);
    }
  }, [isOpen]);

  const handlePhoneChange = (e) => {
    const maskedValue = applyPhoneMask(e.target.value);
    setPhone(maskedValue);
    setError('');
  };

  const handleCodeChange = (index, value) => {
    // Разрешаем только цифры
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Автопереход к следующему полю
    if (value && index < 3) {
      codeInputRefs.current[index + 1]?.focus();
    }

    // Автоматическая отправка при заполнении всех полей
    if (value && index === 3 && newCode.every(digit => digit !== '')) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleCodeKeyDown = (index, e) => {
    // Backspace - переход к предыдущему полю
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pastedData.length === 4) {
      const newCode = pastedData.split('');
      setCode(newCode);
      handleVerifyCode(pastedData);
    }
  };

  const handleSendCode = async () => {
    if (!validateRussianPhone(phone)) {
      setError('Введите корректный номер телефона');
      return;
    }

    setIsLoading(true);
    setError('');

    // Очищаем локальное состояние
    localStorage.removeItem('tomyangbar_user');
    localStorage.removeItem('tomyangbar_token');

    try {
      const response = await apiClient.post('/api/auth/sms/send-code', { phone });
      
      // В dev режиме показываем код
      if (response.devCode) {
        setDevCode(response.devCode);
      }
      
      setStep('code');
      setCountdown(60);
      
    } catch (err) {
      setError(err.message || 'Ошибка отправки кода');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (codeString) => {
    const fullCode = codeString || code.join('');
    
    if (fullCode.length !== 4) {
      setError('Введите 4-значный код');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/api/auth/sms/verify', {
        phone,
        code: fullCode,
        name: name || undefined
      });

      if (response.isNewUser && !name) {
        // Новый пользователь - просим ввести имя
        setIsNewUser(true);
        setStep('name');
        setIsLoading(false);
        return;
      }

      // Сохраняем токен
      if (response.token) {
        apiClient.setToken(response.token);
      }

      // Сохраняем пользователя
      localStorage.setItem('tomyangbar_user', JSON.stringify(response.user));

      onAuthSuccess(response.user);
      onClose();

    } catch (err) {
      setError(err.message || 'Неверный код');
      setCode(['', '', '', '']);
      codeInputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameSubmit = async () => {
    if (!name.trim()) {
      setError('Введите ваше имя');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Повторно верифицируем с именем
      const response = await apiClient.post('/api/auth/sms/verify', {
        phone,
        code: code.join(''),
        name: name.trim()
      });

      // Сохраняем токен
      if (response.token) {
        apiClient.setToken(response.token);
      }

      // Сохраняем пользователя
      localStorage.setItem('tomyangbar_user', JSON.stringify(response.user));

      onAuthSuccess(response.user);
      onClose();

    } catch (err) {
      // Если код истёк, возвращаемся к вводу телефона
      setError('Код истёк. Запросите новый');
      setStep('phone');
      setCode(['', '', '', '']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    setError('');
    setCode(['', '', '', '']);

    try {
      const response = await apiClient.post('/api/auth/sms/send-code', { phone });
      
      if (response.devCode) {
        setDevCode(response.devCode);
      }
      
      setCountdown(60);
      codeInputRefs.current[0]?.focus();
      
    } catch (err) {
      setError(err.message || 'Ошибка отправки кода');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step === 'code') {
      setStep('phone');
      setCode(['', '', '', '']);
      setError('');
    } else if (step === 'name') {
      setStep('code');
      setError('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.5 
            }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -translate-y-12 translate-x-12"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full translate-y-8 -translate-x-8"></div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-3">
                  {step !== 'phone' && (
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={goBack}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors mr-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </motion.button>
                  )}
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    {step === 'phone' && <Phone className="w-6 h-6" />}
                    {step === 'code' && <MessageSquare className="w-6 h-6" />}
                    {step === 'name' && <User className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {step === 'phone' && 'Вход'}
                      {step === 'code' && 'Код из SMS'}
                      {step === 'name' && 'Как вас зовут?'}
                    </h2>
                    <p className="text-primary-100">
                      {step === 'phone' && 'Введите номер телефона'}
                      {step === 'code' && `Отправлен на ${phone}`}
                      {step === 'name' && 'Завершите регистрацию'}
                    </p>
                  </div>
                </div>
                
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  onClick={onClose}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
                >
                  <p className="text-red-600 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Dev code hint */}
              {devCode && step === 'code' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4"
                >
                  <p className="text-blue-600 text-sm">
                    🛠️ <strong>Dev режим:</strong> Код для входа: <span className="font-mono font-bold">{devCode}</span>
                  </p>
                </motion.div>
              )}

              {/* Step: Phone */}
              {step === 'phone' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Номер телефона
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-primary-100 rounded-full p-1">
                        <Phone className="text-primary-600 w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        className="w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 border-gray-200 hover:border-gray-300 text-lg"
                        placeholder="+7 (999) 123-45-67"
                        autoFocus
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendCode}
                    disabled={isLoading || !phone}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      'Получить код'
                    )}
                  </motion.button>

                  {/* Бонус за регистрацию */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-full p-2">
                        <Gift className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-amber-900">200 бонусов в подарок!</p>
                        <p className="text-amber-700 text-sm">За регистрацию на сайте</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Step: Code */}
              {step === 'code' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                      Введите код из SMS
                    </label>
                    <div className="flex justify-center gap-3" onPaste={handleCodePaste}>
                      {code.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (codeInputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(index, e)}
                          className="w-14 h-16 text-center text-2xl font-bold border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 border-gray-200 hover:border-gray-300"
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleVerifyCode()}
                    disabled={isLoading || code.some(d => !d)}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Проверка...
                      </>
                    ) : (
                      'Подтвердить'
                    )}
                  </motion.button>

                  <div className="mt-4 text-center">
                    {countdown > 0 ? (
                      <p className="text-gray-500 text-sm">
                        Отправить код повторно через {countdown} сек.
                      </p>
                    ) : (
                      <button
                        onClick={handleResendCode}
                        disabled={isLoading}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Отправить код повторно
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step: Name */}
              {step === 'name' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ваше имя
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-primary-100 rounded-full p-1">
                        <User className="text-primary-600 w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setError(''); }}
                        className="w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 border-gray-200 hover:border-gray-300 text-lg"
                        placeholder="Введите ваше имя"
                        autoFocus
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNameSubmit}
                    disabled={isLoading || !name.trim()}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Регистрация...
                      </>
                    ) : (
                      'Завершить регистрацию'
                    )}
                  </motion.button>

                  {/* Бонус */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-2">
                        <Gift className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-900">Почти готово!</p>
                        <p className="text-green-700 text-sm">200 бонусов ждут вас</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
