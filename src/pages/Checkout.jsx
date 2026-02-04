import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Truck, Store, CreditCard, ArrowLeft, User, Gift, Coins } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartContext } from '../context/CartContext';
import { useSupabaseUser } from '../context/SupabaseUserContext';
import { OrderService } from '../services/orderService.js';
import { UserService } from '../services/userService.js';
import OrderSuccessModal from '../components/OrderSuccessModal';
import AuthModal from '../components/AuthModal';
import PaymentModal from '../components/PaymentModal';
import AddressChecker from '../components/AddressChecker';
import AddressAutocomplete from '../components/AddressAutocomplete';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCartContext();
  const { user, login, addOrder } = useSupabaseUser();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    deliveryType: 'delivery', // 'delivery' или 'pickup'
    deliveryTime: 'asap', // 'asap', 'specific'
    specificTime: '',
    paymentMethod: 'cash', // 'cash', 'card', 'sbp'
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentOrderData, setCurrentOrderData] = useState(null);
  const [deliveryZone, setDeliveryZone] = useState(null);
  const [isAddressValid, setIsAddressValid] = useState(false);
  
  // Состояние для бонусов
  const [bonusesToUse, setBonusesToUse] = useState(0);
  const [useBonuses, setUseBonuses] = useState(false);

  // Заполняем форму данными пользователя, если он авторизован
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const deliveryFee = formData.deliveryType === 'delivery' ? 200 : 0;
  
  // Получаем данные о бонусах пользователя
  const userBonusBalance = user?.bonus_balance || user?.loyaltyInfo?.bonusBalance || 0;
  const userLoyaltyLevel = user?.loyalty_level || user?.loyaltyInfo?.level || 'bronze';
  
  // Максимальное количество бонусов для использования (100% от суммы заказа или весь баланс)
  const maxBonusesToUse = Math.min(userBonusBalance, Math.floor(totalPrice));
  
  // Корректируем bonusesToUse если он превышает максимум
  const actualBonusesToUse = useBonuses ? Math.min(bonusesToUse, maxBonusesToUse) : 0;
  
  // Итоговая сумма с учетом бонусов
  const finalTotalPrice = totalPrice + deliveryFee - actualBonusesToUse;
  
  // Расчет бонусов, которые будут начислены за заказ
  const cashbackPercent = { bronze: 2, silver: 3, gold: 5 }[userLoyaltyLevel] || 2;
  const bonusesToEarn = user ? Math.floor((totalPrice - actualBonusesToUse) * cashbackPercent / 100) : 0;

  // Обработчики для проверки адреса
  const handleZoneFound = (zone) => {
    setDeliveryZone(zone);
    setIsAddressValid(true);
  };

  const handleZoneNotFound = () => {
    setDeliveryZone(null);
    setIsAddressValid(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаем ошибку при вводе
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Введите имя';
    if (!formData.phone.trim()) newErrors.phone = 'Введите номер телефона';
    if (!formData.email.trim()) newErrors.email = 'Введите email';
    if (formData.deliveryType === 'delivery' && !formData.address.trim()) {
      newErrors.address = 'Введите адрес доставки';
    }
    if (formData.deliveryTime === 'specific' && !formData.specificTime) {
      newErrors.specificTime = 'Выберите время доставки';
    }

    // Проверяем соответствие суммы заказа зоне доставки
    if (formData.deliveryType === 'delivery' && formData.address.trim()) {
      if (!isAddressValid) {
        newErrors.address = 'Адрес не входит в зону доставки';
      } else if (deliveryZone && totalPrice < deliveryZone.minOrder) {
        newErrors.delivery = `Минимальная сумма заказа для ${deliveryZone.name.toLowerCase()}: ${deliveryZone.minOrder}₽`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Создаем объект заказа
      const orderData = {
        customerName: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        deliveryType: formData.deliveryType,
        deliveryTime: formData.deliveryTime,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        items: cart,
        total: totalPrice,
        finalTotal: finalTotalPrice,
        deliveryFee: deliveryFee,
        bonusesToUse: actualBonusesToUse,
        userId: user?.id || null
      };
      
      // Если выбран онлайн-платеж - НЕ создаем заказ сразу
      // Заказ будет создан после успешной оплаты
      if (formData.paymentMethod === 'card') {
        // Сохраняем данные заказа для создания после оплаты
        localStorage.setItem('pending_order_data', JSON.stringify(orderData));
        
        setCurrentOrderData({
          ...orderData,
          orderId: `temp_${Date.now()}` // Временный ID для платежа
        });
        setIsPaymentModalOpen(true);
      } else {
        // Для наличных создаем заказ сразу
        let newOrder;
        if (user) {
          newOrder = await addOrder(orderData);
          if (newOrder.bonuses) {
            console.log('💰 Бонусы обновлены:', newOrder.bonuses);
          }
        } else {
          newOrder = await OrderService.createOrder(orderData, null);
        }
        
        setOrderNumber(newOrder.order_number || newOrder.id);
        setShowSuccessModal(true);
      }
    }
  };

  const handleAuthSuccess = (userData) => {
    login(userData);
    setIsAuthModalOpen(false);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    clearCart();
    navigate('/');
  };

  const handlePaymentSuccess = (paymentId) => {
    setIsPaymentModalOpen(false);
    setOrderNumber(currentOrderData.orderId);
    setShowSuccessModal(true);
    clearCart();
  };

  const handlePaymentError = (error) => {
    console.error('Ошибка платежа:', error);
    // Можно показать уведомление об ошибке
  };

  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false);
    setCurrentOrderData(null);
  };


  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Корзина пуста</h2>
          <p className="text-gray-600 mb-6">Добавьте блюда в корзину для оформления заказа</p>
          <Link to="/menu" className="btn-primary">
            Перейти к меню
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link to="/cart" className="flex items-center text-gray-600 hover:text-primary-600 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Вернуться к корзине
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Оформление заказа</h1>
              <p className="text-sm text-gray-500">注文フォーム</p>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Форма заказа */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Auth Section - Hidden */}
                {/* {!user && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-blue-600 mr-2" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-900">
                            У вас есть аккаунт?
                          </h4>
                          <p className="text-xs text-blue-700">
                            Войдите, чтобы сохранить заказ в личном кабинете
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAuthModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Войти
                      </button>
                    </div>
                  </div>
                )} */}

                {/* Контактная информация */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-primary-600" />
                    Контактная информация
                    <span className="text-xs text-gray-400 ml-2">連絡先</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Имя *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ваше имя"
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Телефон *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="+7 (999) 123-45-67"
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="your@email.com"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                  </div>
                </div>

                {/* Тип доставки */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Способ получения
                    <span className="text-xs text-gray-400 ml-2">配達方法</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`relative border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.deliveryType === 'delivery' 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name="deliveryType"
                        value="delivery"
                        checked={formData.deliveryType === 'delivery'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="flex items-center">
                        <Truck className="w-6 h-6 text-primary-600 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">Доставка</div>
                          <div className="text-sm text-gray-500">Доставка за 45 минут</div>
                        </div>
                      </div>
                    </label>
                    <label className={`relative border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.deliveryType === 'pickup' 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name="deliveryType"
                        value="pickup"
                        checked={formData.deliveryType === 'pickup'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="flex items-center">
                        <Store className="w-6 h-6 text-primary-600 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">Самовывоз</div>
                          <div className="text-sm text-gray-500">Забрать из ресторана</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Адрес доставки */}
                {formData.deliveryType === 'delivery' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                      Адрес доставки
                      <span className="text-xs text-gray-400 ml-2">住所</span>
                    </h3>
                    <AddressAutocomplete
                      value={formData.address}
                      onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
                      placeholder="Введите адрес доставки"
                      className={`${errors.address ? 'border-red-500' : ''}`}
                      onAddressSelect={(suggestion) => {
                        // Дополнительная обработка при выборе адреса из подсказок
                        console.log('Выбран адрес:', suggestion);
                      }}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    
                    {/* Проверка адреса */}
                    <AddressChecker 
                      address={formData.address}
                      onZoneFound={handleZoneFound}
                      onZoneNotFound={handleZoneNotFound}
                    />
                  </div>
                )}

                {/* Время доставки */}
                <div>
                                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-primary-600" />
                      Время доставки
                      <span className="text-xs text-gray-400 ml-2">配達時間</span>
                    </h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="deliveryTime"
                        value="asap"
                        checked={formData.deliveryTime === 'asap'}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <span>Как можно скорее (45-60 минут)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="deliveryTime"
                        value="specific"
                        checked={formData.deliveryTime === 'specific'}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <span>К определенному времени</span>
                    </label>
                    {formData.deliveryTime === 'specific' && (
                      <div className="ml-6">
                        <input
                          type="datetime-local"
                          name="specificTime"
                          value={formData.specificTime}
                          onChange={handleInputChange}
                          className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            errors.specificTime ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.specificTime && <p className="text-red-500 text-sm mt-1">{errors.specificTime}</p>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Способ оплаты */}
                <div>
                                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-primary-600" />
                      Способ оплаты
                      <span className="text-xs text-gray-400 ml-2">支払い方法</span>
                    </h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={formData.paymentMethod === 'cash'}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <span>Наличными при получении</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <span>Онлайн-платеж</span>
                    </label>
                  </div>
                </div>

                {/* Использование бонусов */}
                {user && userBonusBalance > 0 && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Gift className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-purple-900">Оплата бонусами</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useBonuses}
                          onChange={(e) => {
                            setUseBonuses(e.target.checked);
                            if (e.target.checked) {
                              setBonusesToUse(maxBonusesToUse);
                            } else {
                              setBonusesToUse(0);
                            }
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-purple-800 mb-3">
                      <span>Доступно бонусов:</span>
                      <span className="font-bold">{userBonusBalance.toLocaleString()} ₽</span>
                    </div>
                    
                    {useBonuses && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max={maxBonusesToUse}
                            value={bonusesToUse}
                            onChange={(e) => setBonusesToUse(Number(e.target.value))}
                            className="flex-1 h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                          />
                          <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-lg border border-purple-200">
                            <Coins className="w-4 h-4 text-purple-500" />
                            <input
                              type="number"
                              min="0"
                              max={maxBonusesToUse}
                              value={bonusesToUse}
                              onChange={(e) => setBonusesToUse(Math.min(Number(e.target.value), maxBonusesToUse))}
                              className="w-20 text-center font-bold text-purple-900 bg-transparent focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-purple-600">
                          <span>0 ₽</span>
                          <span>Макс: {maxBonusesToUse.toLocaleString()} ₽</span>
                        </div>
                        {actualBonusesToUse > 0 && (
                          <div className="mt-3 p-2 bg-purple-100 rounded-lg text-sm text-purple-800">
                            💰 Скидка бонусами: <strong>-{actualBonusesToUse.toLocaleString()} ₽</strong>
                          </div>
                        )}
                      </motion.div>
                    )}
                    
                    {bonusesToEarn > 0 && (
                      <div className="mt-3 pt-3 border-t border-purple-200 text-sm text-purple-700">
                        🎁 За этот заказ вы получите: <strong className="text-purple-900">+{bonusesToEarn} бонусов</strong> ({cashbackPercent}% кэшбэк)
                      </div>
                    )}
                  </div>
                )}

                {/* Комментарий к заказу */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Комментарий к заказу
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Дополнительные пожелания, инструкции для курьера..."
                  />
                </div>

                {/* Предупреждение о недостаточной сумме заказа */}
                {formData.deliveryType === 'delivery' && deliveryZone && totalPrice < deliveryZone.minOrder && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-orange-800">
                          Недостаточная сумма заказа
                        </h3>
                        <div className="mt-2 text-sm text-orange-700">
                          <p>Для {deliveryZone.name.toLowerCase()} минимальная сумма заказа составляет <strong>{deliveryZone.minOrder}₽</strong></p>
                          <p className="mt-1">Текущая сумма: <strong>{totalPrice}₽</strong></p>
                          <p className="mt-1">Нужно добавить еще: <strong className="text-orange-900">{deliveryZone.minOrder - totalPrice}₽</strong></p>
                        </div>
                        <div className="mt-3">
                          <div className="flex space-x-3">
                            <Link 
                              to="/menu" 
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                              Добавить блюда
                            </Link>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, deliveryType: 'pickup' }))}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                              Выбрать самовывоз
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ошибка валидации доставки */}
                {errors.delivery && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 font-medium">{errors.delivery}</p>
                    <p className="text-red-600 text-sm mt-1">
                      Добавьте блюда на сумму {deliveryZone ? deliveryZone.minOrder - totalPrice : 0}₽ или выберите самовывоз
                    </p>
                  </div>
                )}

                {/* Кнопка оформления */}
                <button
                  type="submit"
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    formData.deliveryType === 'delivery' && deliveryZone && totalPrice < deliveryZone.minOrder
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                  disabled={formData.deliveryType === 'delivery' && (!isAddressValid || (deliveryZone && totalPrice < deliveryZone.minOrder))}
                >
                  {formData.deliveryType === 'delivery' && deliveryZone && totalPrice < deliveryZone.minOrder
                    ? `Минимум ${deliveryZone.minOrder}₽ для доставки`
                    : `Оформить заказ за ${finalTotalPrice} ₽`
                  }
                </button>
              </form>
            </motion.div>
          </div>

          {/* Сводка заказа */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-lg p-6 sticky top-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ваш заказ</h3>
              
              <div className="space-y-3 mb-6">
                {cart.map((item, index) => (
                  <div key={item.dish_id || item.id || index} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.dish_name || item.name}</div>
                      <div className="text-sm text-gray-500">Количество: {item.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{item.price * item.quantity} ₽</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span>Стоимость блюд:</span>
                  <span>{totalPrice} ₽</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Доставка:</span>
                  <span>{deliveryFee} ₽</span>
                </div>
                {actualBonusesToUse > 0 && (
                  <div className="flex justify-between text-sm text-purple-600">
                    <span className="flex items-center gap-1">
                      <Gift className="w-4 h-4" />
                      Оплата бонусами:
                    </span>
                    <span>-{actualBonusesToUse} ₽</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold text-gray-900 border-t border-gray-200 pt-2">
                  <span>Итого:</span>
                  <span>{finalTotalPrice} ₽</span>
                </div>
                {user && bonusesToEarn > 0 && (
                  <div className="flex justify-between text-sm text-green-600 pt-1">
                    <span>Вы получите бонусов:</span>
                    <span>+{bonusesToEarn} 🎁</span>
                  </div>
                )}
              </div>

              <div className={`mt-6 p-4 rounded-lg ${
                formData.deliveryType === 'delivery' && deliveryZone && totalPrice < deliveryZone.minOrder
                  ? 'bg-orange-50 border border-orange-200'
                  : 'bg-gray-50'
              }`}>
                <div className={`text-sm ${
                  formData.deliveryType === 'delivery' && deliveryZone && totalPrice < deliveryZone.minOrder
                    ? 'text-orange-700'
                    : 'text-gray-600'
                }`}>
                  <div className="font-medium mb-2">Информация о доставке:</div>
                  {formData.deliveryType === 'delivery' ? (
                    deliveryZone ? (
                      <>
                        <div>• Зона: {deliveryZone.name}</div>
                        <div className={`${totalPrice < deliveryZone.minOrder ? 'text-orange-800 font-semibold' : ''}`}>
                          • Минимальная сумма: {deliveryZone.minOrder} ₽
                          {totalPrice < deliveryZone.minOrder && (
                            <span className="ml-1 text-orange-600">(не хватает {deliveryZone.minOrder - totalPrice}₽)</span>
                          )}
                        </div>
                        <div>• Время доставки: {deliveryZone.deliveryTime}</div>
                        <div>• Стоимость доставки: {deliveryFee} ₽</div>
                      </>
                    ) : (
                      <>
                        <div>• Введите адрес для проверки зоны</div>
                        <div>• Минимальная сумма: от 2 ₽</div>
                        <div>• Время доставки: 45-120 минут</div>
                      </>
                    )
                  ) : (
                    <>
                      <div>• Самовывоз из ресторана</div>
                      <div>• Минимальная сумма: 500 ₽</div>
                      <div>• Время приготовления: 20-30 минут</div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <OrderSuccessModal
        isOpen={showSuccessModal}
        orderNumber={orderNumber}
        onClose={handleSuccessModalClose}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Payment Modal */}
      {currentOrderData && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handlePaymentModalClose}
          orderData={currentOrderData}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}

    </div>
  );
};

export default Checkout;
