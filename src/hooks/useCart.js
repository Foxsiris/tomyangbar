import { useState, useEffect, useCallback } from 'react';

export const useCart = () => {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState({
    isVisible: false,
    dishName: ''
  });

  // Загружаем корзину из localStorage при инициализации
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Сохраняем корзину в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((dish, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === dish.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === dish.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { ...dish, quantity }];
      }
    });

    // Показываем уведомление
    setNotification({
      isVisible: true,
      dishName: dish.name
    });

    // Скрываем уведомление через 3 секунды
    setTimeout(() => {
      setNotification({
        isVisible: false,
        dishName: ''
      });
    }, 3000);
  }, []);

  const removeFromCart = (dishId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== dishId));
  };

  const updateQuantity = (dishId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(dishId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === dishId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  return {
    cart,
    isOpen,
    notification,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    openCart,
    closeCart
  };
};
