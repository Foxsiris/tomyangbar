import { useState, useEffect, useCallback } from 'react';
import { CartService } from '../services/cartService.js';

export const useSupabaseCart = (userId = null) => {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({
    isVisible: false,
    dishName: ''
  });

  // Генерируем sessionId для неавторизованных пользователей
  const [sessionId] = useState(() => {
    if (userId) return null;
    const stored = localStorage.getItem('cart_session_id');
    if (stored) return stored;
    const newId = CartService.generateSessionId();
    localStorage.setItem('cart_session_id', newId);
    return newId;
  });

  // Загружаем корзину при инициализации
  useEffect(() => {
    const loadCart = async () => {
      try {
        setIsLoading(true);
        const fullCart = await CartService.getFullCart(userId, sessionId);
        setCart(fullCart.items || []);
      } catch (error) {
        console.error('Error loading cart:', error);
        setCart([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [userId, sessionId]);

  // Переносим корзину при авторизации пользователя
  useEffect(() => {
    if (userId && sessionId) {
      const transferCart = async () => {
        try {
          await CartService.transferCartToUser(sessionId, userId);
          // Очищаем sessionId из localStorage
          localStorage.removeItem('cart_session_id');
          // Перезагружаем корзину
          const fullCart = await CartService.getFullCart(userId, null);
          setCart(fullCart.items || []);
        } catch (error) {
          console.error('Error transferring cart:', error);
        }
      };

      transferCart();
    }
  }, [userId, sessionId]);

  const addToCart = useCallback(async (dish, quantity = 1) => {
    try {
      const fullCart = await CartService.getFullCart(userId, sessionId);
      await CartService.addToCart(fullCart.id, dish, quantity);
      
      // Обновляем локальное состояние - получаем только элементы корзины
      const items = await CartService.getCartItems(fullCart.id);
      setCart(items || []);

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
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }, [userId, sessionId]);

  const removeFromCart = useCallback(async (cartItemId) => {
    try {
      await CartService.removeFromCart(cartItemId);
      
      // Обновляем локальное состояние - удаляем элемент из массива
      setCart(prevCart => prevCart.filter(item => item.id !== cartItemId));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }, []);

  const updateQuantity = useCallback(async (cartItemId, quantity) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(cartItemId);
        return;
      }
      
      const updatedItem = await CartService.updateCartItemQuantity(cartItemId, quantity);
      
      // Обновляем локальное состояние - обновляем элемент в массиве
      setCart(prevCart => 
        prevCart.map(item => 
          item.id === cartItemId ? { ...item, quantity: updatedItem.quantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }, [removeFromCart]);

  const clearCart = useCallback(async () => {
    try {
      const fullCart = await CartService.getFullCart(userId, sessionId);
      await CartService.clearCart(fullCart.id);
      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }, [userId, sessionId]);

  const getTotalItems = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const getTotalPrice = useCallback(() => {
    return cart.reduce((total, item) => total + (item.quantity * item.price), 0);
  }, [cart]);

  const openCart = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    cart,
    isOpen,
    setIsOpen,
    isLoading,
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
