import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Truck, Store, CreditCard, ArrowLeft, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartContext } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { addNewOrder } from '../data/ordersData';
import OrderSuccessModal from '../components/OrderSuccessModal';
import AuthModal from '../components/AuthModal';
import PaymentModal from '../components/PaymentModal';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCartContext();
  const { user, login, addOrder } = useUser();
  
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
  const totalPrice = getTotalPrice() + deliveryFee;

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
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
        total: totalPrice
      };
      
      // Добавляем заказ в систему
      let newOrder;
      if (user) {
        // Если пользователь авторизован, используем addOrder (он сам вызовет addNewOrder)
        newOrder = addOrder(orderData);
      } else {
        // Если пользователь не авторизован, создаем заказ напрямую
        newOrder = addNewOrder(orderData);
      }
      
      // Если выбран онлайн-платеж, показываем модальное окно платежа
      if (formData.paymentMethod === 'card') {
        setCurrentOrderData({
          ...orderData,
          orderId: newOrder.id
        });
        setIsPaymentModalOpen(true);
      } else {
        // Для наличных показываем обычное окно успеха
        setOrderNumber(newOrder.id);
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
                {/* Auth Section */}
                {!user && (
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
                )}

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
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Улица, дом, квартира"
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
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
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Карта, СБП, ЮMoney
                      </span>
                    </label>
                  </div>
                </div>

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

                {/* Кнопка оформления */}
                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Оформить заказ за {totalPrice} ₽
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
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.name}</div>
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
                  <span>{getTotalPrice()} ₽</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Доставка:</span>
                  <span>{deliveryFee} ₽</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900 border-t border-gray-200 pt-2">
                  <span>Итого:</span>
                  <span>{totalPrice} ₽</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <div className="font-medium mb-2">Информация о доставке:</div>
                  <div>• Минимальная сумма заказа: 1000 ₽</div>
                  <div>• Время доставки: 45-60 минут</div>
                  <div>• Бесплатная доставка от 1000 ₽</div>
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
