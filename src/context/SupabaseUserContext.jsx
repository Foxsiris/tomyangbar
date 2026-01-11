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
  const [isInitialized, setIsInitialized] = useState(false);

  // Загружаем пользователя из localStorage при инициализации
  useEffect(() => {
    let isMounted = true;
    
    const loadUser = async () => {
      try {
        const savedUser = localStorage.getItem('tomyangbar_user');
        const token = localStorage.getItem('tomyangbar_token');
        
        if (savedUser && token) {
          const userData = JSON.parse(savedUser);
          
          // Сначала показываем кешированные данные для быстрого UI
          if (isMounted) {
            setUser(userData);
          }
          
          // Затем асинхронно обновляем данные из БД
          try {
            const currentUser = await UserService.findById(userData.id);
            if (isMounted) {
              if (currentUser) {
                // Обновляем пользователя свежими данными (включая бонусы)
                setUser(currentUser);
              } else {
                // Пользователь не найден в БД, очищаем
                setUser(null);
                localStorage.removeItem('tomyangbar_user');
                localStorage.removeItem('tomyangbar_token');
              }
            }
          } catch (fetchError) {
            console.warn('Could not refresh user data from server:', fetchError);
            // Оставляем кешированные данные, не очищаем
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        if (isMounted) {
          setUser(null);
        }
        localStorage.removeItem('tomyangbar_user');
        localStorage.removeItem('tomyangbar_token');
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    loadUser();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Сохраняем пользователя в localStorage при изменении (только после инициализации)
  useEffect(() => {
    if (!isInitialized) return;
    
    if (user) {
      localStorage.setItem('tomyangbar_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tomyangbar_user');
    }
  }, [user, isInitialized]);

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
      setUser(prev => {
        const updates = {
          ...prev,
          orders: [newOrder, ...(prev.orders || [])]
        };
        
        // Если есть информация о бонусах, обновляем баланс
        if (newOrder.bonuses) {
          updates.bonus_balance = newOrder.bonuses.newBalance;
          // Также обновляем loyaltyInfo если он есть
          if (prev.loyaltyInfo) {
            updates.loyaltyInfo = {
              ...prev.loyaltyInfo,
              bonusBalance: newOrder.bonuses.newBalance
            };
          }
        }
        
        return updates;
      });

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

  // Получение заказов пользователя - стабильная ссылка через useCallback
  const getUserOrders = useCallback(async () => {
    if (!user?.id) return [];

    try {
      const orders = await UserService.getUserOrders();
      return orders || [];
    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  }, [user?.id]);

  // Получение статистики пользователя
  const getUserStats = useCallback(async () => {
    if (!user?.id) return null;

    try {
      const stats = await UserService.getUserStats(user.id);
      return stats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }, [user?.id]);

  // Обновление данных пользователя из БД (включая бонусы)
  const refreshUserData = useCallback(async () => {
    if (!user?.id) return null;

    try {
      const updatedUser = await UserService.findById(user.id);
      if (updatedUser) {
        setUser(prev => ({
          ...prev,
          ...updatedUser
        }));
        return updatedUser;
      }
      return null;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return null;
    }
  }, [user?.id]);

  // Получение информации о лояльности
  const getLoyaltyInfo = useCallback(async () => {
    if (!user?.id) return null;

    try {
      const loyaltyInfo = await UserService.getLoyaltyInfo();
      // Обновляем данные пользователя с новой информацией о лояльности
      if (loyaltyInfo) {
        setUser(prev => ({
          ...prev,
          loyaltyInfo,
          bonus_balance: loyaltyInfo.bonusBalance,
          total_spent: loyaltyInfo.totalSpent,
          loyalty_level: loyaltyInfo.level
        }));
      }
      return loyaltyInfo;
    } catch (error) {
      console.error('Error getting loyalty info:', error);
      return null;
    }
  }, [user?.id]);

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
    refreshUserData,
    getLoyaltyInfo,
    isAuthenticated: !!user
  };

  return (
    <SupabaseUserContext.Provider value={value}>
      {children}
    </SupabaseUserContext.Provider>
  );
};
