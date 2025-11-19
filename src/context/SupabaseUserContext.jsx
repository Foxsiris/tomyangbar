import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserService } from '../services/userService.js';
import { OrderService } from '../services/orderService.js';

const SupabaseUserContext = createContext();

export const useSupabaseUser = () => {
  const context = useContext(SupabaseUserContext);
  if (!context) {
    throw new Error('useSupabaseUser must be used within a SupabaseUserProvider');
  }
  return context;
};

export const SupabaseUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем пользователя из localStorage при инициализации
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = localStorage.getItem('tomyangbar_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          // Проверяем, что пользователь все еще существует в БД
          const currentUser = await UserService.findById(userData.id);
          if (currentUser) {
            setUser(currentUser);
          } else {
            // Пользователь не найден в БД, очищаем localStorage
            localStorage.removeItem('tomyangbar_user');
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('tomyangbar_user');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Сохраняем пользователя в localStorage при изменении
  useEffect(() => {
    if (user) {
      localStorage.setItem('tomyangbar_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tomyangbar_user');
    }
  }, [user]);

  const login = async (userData) => {
    try {
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tomyangbar_user');
    localStorage.removeItem('cart_session_id');
  };

  const updateUser = async (updates) => {
    if (!user) return;

    try {
      const updatedUser = await UserService.update(user.id, updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const addOrder = async (orderData) => {
    if (!user) return;

    try {
      const newOrder = await OrderService.createOrder(orderData, user.id);
      
      // Обновляем локальное состояние пользователя
      setUser(prev => ({
        ...prev,
        orders: [newOrder, ...(prev.orders || [])]
      }));

      return newOrder;
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!user) return;

    try {
      const updatedOrder = await OrderService.updateOrderStatus(orderId, newStatus);
      
      // Обновляем локальное состояние
      setUser(prev => ({
        ...prev,
        orders: prev.orders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
            : order
        )
      }));

      return updatedOrder;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  const getUserOrders = useCallback(async () => {
    if (!user) return [];

    try {
      const orders = await UserService.getUserOrders(user.id);
      return orders;
    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  }, [user]);

  const getUserStats = async () => {
    if (!user) return null;

    try {
      const stats = await UserService.getUserStats(user.id);
      return stats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
    addOrder,
    updateOrderStatus,
    getUserOrders,
    getUserStats,
    isAuthenticated: !!user
  };

  return (
    <SupabaseUserContext.Provider value={value}>
      {children}
    </SupabaseUserContext.Provider>
  );
};
