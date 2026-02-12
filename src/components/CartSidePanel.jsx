import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, Phone } from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import MinimumOrderAlert from './MinimumOrderAlert';

const CartSidePanel = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    isOpen, 
    closeCart, 
    removeFromCart, 
    updateQuantity, 
    totalPrice, 
    clearCart
  } = useCartContext();

  // Блокируем скролл body при открытии корзины
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

  const handleCheckout = () => {
    if (totalPrice < 2) {
      alert('Минимальная сумма заказа 2 рубля');
      return;
    }
    closeCart();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={closeCart}
          />

          {/* Side Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center space-x-2">
                <img 
                  src="/logo.png" 
                  alt="Tom Yang Bar" 
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🦆</text></svg>';
                  }}
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Корзина ({cart.length})
                  </h3>
                  <p className="text-xs text-gray-500">カート</p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <img 
                    src="/logo.png" 
                    alt="Tom Yang Bar" 
                    className="w-16 h-16 mx-auto mb-4 object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🦆</text></svg>';
                    }}
                  />
                  <p className="text-gray-600 text-lg mb-2">Корзина пуста</p>
                  <p className="text-sm text-gray-500 mb-2">空のカート</p>
                  <p className="text-sm text-gray-500">
                    Добавьте блюда из меню
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div key={item.dish_id || item.id || index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-white">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        {(item.image_url || item.image) ? (
                          <img
                            src={item.image_url || item.image}
                            alt={item.dish_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<span class="flex items-center justify-center w-full h-full text-2xl">🍽️</span>';
                            }}
                          />
                        ) : (
                          <span className="flex items-center justify-center w-full h-full text-2xl">🍽️</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.dish_name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {item.weight || 'Вес не указан'}
                        </p>
                        <p className="text-sm font-semibold text-primary-600">
                          {item.price} ₽
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.dish_id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.dish_id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.dish_id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-lg text-gray-600">Итого:</span>
                    <p className="text-xs text-gray-500">合計</p>
                  </div>
                  <span className="text-xl font-bold text-primary-600">
                    {totalPrice} ₽
                  </span>
                </div>
                
                <MinimumOrderAlert currentTotal={totalPrice} />

                <div className="flex space-x-3 mb-3">
                  <button
                    onClick={handleCheckout}
                    className="flex-1 btn-primary text-sm py-3"
                  >
                    <div className="flex flex-col items-center">
                      <span>Оформить заказ</span>
                      <span className="text-xs opacity-75">注文する</span>
                    </div>
                  </button>
                  
                  <a
                    href="tel:+79271126500"
                    className="flex-1 btn-secondary text-sm py-3 inline-flex items-center justify-center"
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        <span>Позвонить</span>
                      </div>
                      <span className="text-xs opacity-75">電話する</span>
                    </div>
                  </a>
                </div>
                
                <button
                  onClick={clearCart}
                  className="w-full text-sm text-red-600 hover:text-red-700 py-2"
                >
                  <div className="flex justify-center items-center space-x-2">
                    <span>Очистить корзину</span>
                    <span className="text-xs opacity-75">カートを空にする</span>
                  </div>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartSidePanel;
