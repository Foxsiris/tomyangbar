import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowLeft, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartContext } from '../context/CartContext';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCartContext();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = () => {
    if (totalPrice < 2) {
      alert('Минимальная сумма заказа 2 рубля');
      return;
    }
    setIsCheckingOut(true);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto"
          >
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Корзина пуста
            </h2>
            <p className="text-gray-600 mb-6">
              Добавьте блюда из нашего меню, чтобы сделать заказ
            </p>
            <Link to="/menu" className="btn-primary inline-flex items-center">
              <ArrowLeft className="mr-2 w-5 h-5" />
              Перейти к меню
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Корзина</h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Очистить корзину
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Ваш заказ ({cart.length} {cart.length === 1 ? 'позиция' : 'позиции'})
                </h2>
                
                <div className="space-y-4">
                  {cart.map((item) => (
                    <motion.div
                      key={item.dish_id || item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {item.weight}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.dish_id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.dish_id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary-600">
                          {item.price * item.quantity} ₽
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.price} ₽ за шт.
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.dish_id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Итого заказа
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Товары ({cart.length})</span>
                  <span className="font-medium">{totalPrice} ₽</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Доставка</span>
                  <span className="font-medium text-green-600">
                    {totalPrice >= 2 ? 'Бесплатно' : '200 ₽'}
                  </span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Итого</span>
                  <span className="text-primary-600">
                    {totalPrice >= 2 ? totalPrice : totalPrice + 200} ₽
                  </span>
                </div>
              </div>

              {totalPrice < 2 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    До бесплатной доставки осталось {2 - totalPrice} ₽
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingOut ? 'Оформление...' : 'Оформить заказ'}
                </button>
                
                <a
                  href="tel:+79271126500"
                  className="w-full btn-secondary inline-flex items-center justify-center"
                >
                  <Phone className="mr-2 w-5 h-5" />
                  Заказать по телефону
                </a>
              </div>

              <div className="mt-6 text-xs text-gray-500">
                <p>• Минимальная сумма заказа: 2 ₽</p>
                <p>• Время доставки зависит от загруженности</p>
                <p>• Бесплатная доставка от 2 ₽</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckingOut && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-8 max-w-md mx-4"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Оформление заказа
            </h3>
            <p className="text-gray-600 mb-6">
              Для оформления заказа позвоните нам по телефону:
            </p>
            <a
              href="tel:+79271126500"
              className="btn-primary w-full inline-flex items-center justify-center"
            >
              <Phone className="mr-2 w-5 h-5" />
              +7 (927) 112-65-00
            </a>
            <button
              onClick={() => setIsCheckingOut(false)}
              className="w-full mt-3 text-gray-600 hover:text-gray-800"
            >
              Отмена
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Cart;
