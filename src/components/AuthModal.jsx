/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { UserService } from '../services/userService.js';
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

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Маска для отдельного поля телефона (регистрация)
    if (name === 'phone') {
      const maskedValue = applyPhoneMask(value);
      setFormData(prev => ({
        ...prev,
        [name]: maskedValue
      }));
    } 
    // Поле «Email или телефон» при входе: одновременно поддерживаем оба варианта
    else if (name === 'email' && isLogin) {
      const hasLetters = /[a-zA-Z]/.test(value);
      // Если пользователь вводит email (есть буквы) — не трогаем ввод
      if (hasLetters) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      } else {
        // Если вводятся только цифры/символы телефона — применяем телефонную маску
        const maskedValue = applyPhoneMask(value);
        setFormData(prev => ({
          ...prev,
          [name]: maskedValue
        }));
      }
    } 
    // Остальные поля — без масок
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Для входа проверяем email или телефон
    if (isLogin) {
      if (!formData.email) {
        newErrors.email = 'Email или телефон обязателен';
      } else if (formData.email.includes('@')) {
        // Если это email, проверяем формат email
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Некорректный email';
        }
      } else {
        // Если это телефон, проверяем формат телефона
        if (!validateRussianPhone(formData.email)) {
          newErrors.email = 'Некорректный номер телефона';
        }
      }
    } else {
      // Для регистрации проверяем email отдельно
      if (!formData.email) {
        newErrors.email = 'Email обязателен';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Некорректный email';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Имя обязательно';
      }
      if (!formData.phone) {
        newErrors.phone = 'Телефон обязателен';
      } else if (!validateRussianPhone(formData.phone)) {
        newErrors.phone = 'Некорректный номер телефона';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Пароли не совпадают';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // На всякий случай очищаем локальное состояние перед новой попыткой входа/регистрации,
    // чтобы не было ложного ощущения, что мы уже залогинены старыми данными
    localStorage.removeItem('tomyangbar_user');
    localStorage.removeItem('tomyangbar_token');

    setIsLoading(true);

    try {
      let userData;

      if (isLogin) {
        // Проверяем, это админ или обычный пользователь
        if (formData.email === 'admin@tomyangbar.ru') {
          // Авторизация админа
          userData = await UserService.authenticateAdmin(formData.email, formData.password);
        } else {
          // Вход в систему по email или телефону
          // Очищаем токен админа, если он есть
          localStorage.removeItem('tomyangbar_token');
          userData = await UserService.authenticateByEmailOrPhone(formData.email, formData.password);
        }
      } else {
        // Регистрация
        // Очищаем токен админа, если он есть
        localStorage.removeItem('tomyangbar_token');
        
        const userExists = await UserService.userExists(formData.email);
        if (userExists) {
          setErrors({ email: 'Пользователь с таким email уже существует' });
          setIsLoading(false);
          return;
        }
        
        userData = await UserService.register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });
      }

      // Сохраняем пользователя в localStorage для текущей сессии
      localStorage.setItem('tomyangbar_user', JSON.stringify(userData));
      
      onAuthSuccess(userData);
      onClose();
      
      // Сбрасываем форму
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
      setErrors({});
      
    } catch (error) {
      console.error('Auth error:', error);
      if (error.message === 'Пользователь не найден') {
        setErrors({ email: 'Пользователь не найден' });
      } else if (error.message === 'Неверный пароль') {
        setErrors({ password: 'Неверный пароль' });
      } else if (error.message === 'Неверный email или пароль') {
        // Общая ошибка от бэка — подсвечиваем и логин, и пароль
        setErrors({ 
          email: 'Проверьте email/телефон',
          password: 'Неверный пароль'
        });
      } else if (error.message === 'Пользователь с таким email уже существует') {
        setErrors({ email: 'Пользователь с таким email уже существует' });
      } else {
        setErrors({ general: 'Произошла ошибка. Попробуйте еще раз.' });
      }
    } finally {
      setIsLoading(false);
    }
  };


  const switchMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
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
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {isLogin ? 'Вход' : 'Регистрация'}
                    </h2>
                    <p className="text-primary-100">
                      {isLogin ? 'Добро пожаловать обратно' : 'Создайте новый аккаунт'}
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

              {/* General Error */}
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
                >
                  <p className="text-red-600 text-sm">{errors.general}</p>
                </motion.div>
              )}

              {/* Form */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onSubmit={handleSubmit} 
                className="space-y-4"
              >
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Имя
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-primary-100 rounded-full p-1">
                        <User className="text-primary-600 w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                          errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        placeholder="Введите ваше имя"
                      />
                    </div>
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-2 flex items-center"
                      >
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {errors.name}
                      </motion.p>
                    )}
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isLogin ? 'Email или телефон' : 'Email'}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-primary-100 rounded-full p-1">
                      {isLogin ? (
                        formData.email.includes('@') ? (
                          <Mail className="text-primary-600 w-4 h-4" />
                        ) : (
                          <Phone className="text-primary-600 w-4 h-4" />
                        )
                      ) : (
                        <Mail className="text-primary-600 w-4 h-4" />
                      )}
                    </div>
                    <input
                      type={isLogin ? "text" : "email"}
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                        errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder={isLogin ? "Введите email или +7 (999) 123-45-67" : "Введите email"}
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-2 flex items-center"
                    >
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.email}
                    </motion.p>
                  )}
                </motion.div>

                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Телефон
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-primary-100 rounded-full p-1">
                        <Phone className="text-primary-600 w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                          errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>
                    {errors.phone && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-2 flex items-center"
                      >
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {errors.phone}
                      </motion.p>
                    )}
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Пароль
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-primary-100 rounded-full p-1">
                      <Lock className="text-primary-600 w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                        errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Введите пароль"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-2 flex items-center"
                    >
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.password}
                    </motion.p>
                  )}
                </motion.div>

                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Подтвердите пароль
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-primary-100 rounded-full p-1">
                        <Lock className="text-primary-600 w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                          errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        placeholder="Подтвердите пароль"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-2 flex items-center"
                      >
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Загрузка...
                    </div>
                  ) : (
                    isLogin ? 'Войти' : 'Зарегистрироваться'
                  )}
                </motion.button>
              </motion.form>

              {/* Switch Mode */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="mt-6 text-center"
              >
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-600 mb-2">
                    {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={switchMode}
                    className="text-primary-600 hover:text-primary-700 font-medium bg-white px-4 py-2 rounded-lg border border-primary-200 hover:border-primary-300 transition-all duration-200"
                  >
                    {isLogin ? 'Зарегистрироваться' : 'Войти'}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
