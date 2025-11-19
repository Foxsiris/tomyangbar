/**
 * Утилиты для работы с заказами
 */

/**
 * Форматирует номер заказа для отображения в UI
 * @param {object} order - Объект заказа
 * @param {string} format - Формат: 'short', 'very-short', 'full'
 * @returns {string} - Отформатированный номер заказа
 */
export const formatOrderNumber = (order, format = 'short') => {
  if (!order) return 'N/A';
  
  // Если есть order_number, используем его
  if (order.order_number) {
    switch (format) {
      case 'very-short':
        return order.order_number.toString();
      case 'full':
        return `#${order.order_number}`;
      case 'short':
      default:
        return order.order_number.toString();
    }
  }
  
  // Fallback для старых заказов без order_number
  if (order.id) {
    const shortId = order.id.slice(-8).toUpperCase();
    switch (format) {
      case 'very-short':
        return order.id.slice(-6).toUpperCase();
      case 'full':
        return order.id;
      case 'short':
      default:
        return shortId.slice(0, 4) + '-' + shortId.slice(4);
    }
  }
  
  return 'N/A';
};

/**
 * Получает порядковый номер заказа
 * @param {object} order - Объект заказа
 * @returns {number|string} - Номер заказа
 */
export const getOrderNumber = (order) => {
  if (!order) return 'N/A';
  
  // Приоритет: order_number > короткий ID > полный ID
  if (order.order_number) {
    return order.order_number;
  }
  
  if (order.id) {
    return order.id.slice(-6).toUpperCase();
  }
  
  return 'N/A';
};

/**
 * Создает красивый номер заказа с префиксом #
 * @param {object} order - Объект заказа
 * @returns {string} - Красивый номер заказа
 */
export const getDisplayOrderNumber = (order) => {
  const number = getOrderNumber(order);
  return `#${number}`;
};
