import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showToast = useCallback((message, type = 'success') => {
    setToast({
      message,
      type,
      isVisible: true,
    });

    // Автоматически скрыть через 3 секунды
    setTimeout(() => {
      hideToast();
    }, 3000);
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  return {
    toast,
    showToast,
    hideToast,
  };
};
