import { createContext, useContext, useState, useEffect } from 'react';
import { addNewOrder } from '../data/ordersData';
import { findUserById, addOrderToUser, updateUserOrderStatus } from '../data/usersData';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем пользователя из localStorage при инициализации
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem('tomyangbar_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    // Слушаем изменения в localStorage для синхронизации между вкладками
    const handleStorageChange = (e) => {
      if (e.key === 'tomyangbar_user') {
        if (e.newValue) {
          setUser(JSON.parse(e.newValue));
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Отдельный useEffect для кастомных событий
  useEffect(() => {
    const handleCustomStorageChange = (event) => {
      if (event.detail && event.detail.type === 'orderStatusUpdated' && user) {
        // Обновляем заказы пользователя из системы пользователей
        import('../data/usersData').then(({ getUserOrders }) => {
          const updatedOrders = getUserOrders(user.id);
          setUser(prev => ({
            ...prev,
            orders: updatedOrders
          }));
        }).catch(error => {
          console.error('Ошибка при обновлении заказов пользователя:', error);
        });
      }
    };

    window.addEventListener('customStorageChange', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('customStorageChange', handleCustomStorageChange);
    };
  }, [user]);

  // Сохраняем пользователя в localStorage при изменении
  useEffect(() => {
    if (user) {
      localStorage.setItem('tomyangbar_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tomyangbar_user');
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser(prev => ({
      ...prev,
      ...updates
    }));
  };

  const addOrder = async (orderData) => {
    if (!user) return;

    // Добавляем заказ в общую систему заказов
    const newOrder = await addNewOrder({
      ...orderData,
      customerName: user.name,
      email: user.email,
      phone: user.phone
    }, user.id);

    // Добавляем заказ в историю пользователя
    addOrderToUser(user.id, newOrder);

    // Обновляем локальное состояние пользователя
    setUser(prev => ({
      ...prev,
      orders: [newOrder, ...(prev.orders || [])]
    }));

    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    if (!user) return;

    // Обновляем статус в истории пользователя
    updateUserOrderStatus(user.id, orderId, newStatus);

    // Обновляем локальное состояние
    setUser(prev => ({
      ...prev,
      orders: prev.orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      )
    }));
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
    addOrder,
    updateOrderStatus,
    isAuthenticated: !!user
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
