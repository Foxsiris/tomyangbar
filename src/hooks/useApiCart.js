import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../services/apiClient.js';

export const useApiCart = (userId = null) => {
  const [cart, setCart] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({
    isVisible: false,
    dishName: ''
  });

  // Refs для предотвращения дублирующих запросов
  const loadingRef = useRef(false);
  const loadedRef = useRef(false);

  // Генерируем sessionId для неавторизованных пользователей
  const [sessionId] = useState(() => {
    if (userId) return null;
    const stored = localStorage.getItem('cart_session_id');
    if (stored) return stored;
    const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('cart_session_id', newId);
    return newId;
  });

  // Загружаем корзину при инициализации (только один раз)
  useEffect(() => {
    if (!loadingRef.current && !loadedRef.current) {
      loadCart();
    }
  }, [userId, sessionId]);

  // Загружаем корзину
  const loadCart = useCallback(async () => {
    // Предотвращаем дублирующие запросы
    if (loadingRef.current) {
      return;
    }

    try {
      loadingRef.current = true;
      setIsLoading(true);
      
      const response = await apiClient.getOrCreateCart(sessionId);
      
      setCart(response.cart.items || []);
      setCartId(response.cart.id);
      loadedRef.current = true;
    } catch (error) {
      console.error('Error loading cart:', error);
      setCart([]);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [sessionId]);

  // Добавление блюда в корзину
  const addToCart = useCallback(async (dish) => {
    try {
      if (!cartId) {
        await loadCart();
        return;
      }

      const response = await apiClient.addToCart(cartId, dish);
      
      // Обновляем локальное состояние
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.dish_id === dish.id);
        
        if (existingItem) {
          return prevCart.map(item =>
            item.dish_id === dish.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          // Используем данные из ответа API, которые содержат правильный id
          const dishImage = dish.image || dish.image_url || null;
          return [...prevCart, {
            id: response.item.id,
            dish_id: dish.id,
            dish_name: dish.name,
            name: dish.name,
            price: dish.price,
            quantity: 1,
            image_url: dishImage,
            image: dishImage,
            weight: dish.weight
          }];
        }
      });

      // Показываем уведомление
      setNotification({
        isVisible: true,
        dishName: dish.name
      });

      // Скрываем уведомление через 3 секунды
      setTimeout(() => {
        setNotification(prev => ({ ...prev, isVisible: false }));
      }, 3000);

    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }, [cartId, loadCart]);

  // Удаление блюда из корзины
  const removeFromCart = useCallback(async (dishId) => {
    try {
      const item = cart.find(item => item.dish_id === dishId);
      if (!item) return;

      await apiClient.removeFromCart(item.id);
      
      // Обновляем локальное состояние
      setCart(prevCart => prevCart.filter(item => item.dish_id !== dishId));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }, [cart]);

  // Обновление количества блюда
  const updateQuantity = useCallback(async (dishId, quantity) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(dishId);
        return;
      }

      const item = cart.find(item => item.dish_id === dishId);
      if (!item) return;

      await apiClient.updateCartItem(item.id, quantity);
      
      // Обновляем локальное состояние
      setCart(prevCart =>
        prevCart.map(item =>
          item.dish_id === dishId
            ? { ...item, quantity }
            : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }, [cart, removeFromCart]);

  // Очистка корзины
  const clearCart = useCallback(async () => {
    try {
      if (!cartId) return;

      await apiClient.clearCart(cartId);
      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }, [cartId]);

  // Открытие/закрытие корзины
  const toggleCart = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const openCart = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Вычисляемые значения
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return {
    cart,
    isOpen,
    isLoading,
    notification,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    refreshCart: loadCart
  };
};
