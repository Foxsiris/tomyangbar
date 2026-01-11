import { apiClient } from './apiClient.js';

// Сервис для работы с заказами
export class OrderService {
  // Создание нового заказа
  static async createOrder(orderData, userId = null) {
    try {
      const response = await apiClient.createOrder({
        ...orderData,
        userId
      });
      // Возвращаем заказ с информацией о бонусах
      return {
        ...response.order,
        bonuses: response.bonuses || null
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Получение всех заказов
  static async getAllOrders() {
    try {
      const response = await apiClient.getAllOrders();
      return response.orders;
    } catch (error) {
      console.error('Error getting all orders:', error);
      throw error;
    }
  }

  // Получение заказов по статусу
  static async getOrdersByStatus(status) {
    try {
      const response = await apiClient.getOrdersByStatus(status);
      return response.orders;
    } catch (error) {
      console.error('Error getting orders by status:', error);
      throw error;
    }
  }

  // Получение заказов пользователя
  static async getUserOrders(userId) {
    try {
      const response = await apiClient.getUserOrders();
      return response.orders;
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw error;
    }
  }

  // Обновление статуса заказа
  static async updateOrderStatus(orderId, newStatus) {
    try {
      const response = await apiClient.updateOrderStatus(orderId, newStatus);
      return response.order;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Получение статистики заказов
  static async getOrderStats() {
    try {
      const response = await apiClient.getOrderStats();
      return response.stats;
    } catch (error) {
      console.error('Error getting order stats:', error);
      throw error;
    }
  }

  // Получение популярных блюд
  static async getPopularDishes() {
    try {
      const response = await apiClient.get('/orders/popular-dishes');
      return response.dishes;
    } catch (error) {
      console.error('Error getting popular dishes:', error);
      throw error;
    }
  }

  // Получение почасовой статистики
  static async getHourlyStats() {
    try {
      const response = await apiClient.get('/orders/stats/hourly');
      return response.stats;
    } catch (error) {
      console.error('Error getting hourly stats:', error);
      throw error;
    }
  }

  // Получение недельной статистики
  static async getWeeklyStats() {
    try {
      const response = await apiClient.get('/orders/stats/weekly');
      return response.stats;
    } catch (error) {
      console.error('Error getting weekly stats:', error);
      throw error;
    }
  }

  // Получение заказов по диапазону дат
  static async getOrdersByDateRange(startDate, endDate) {
    try {
      const response = await apiClient.get(`/orders?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
      return response.orders;
    } catch (error) {
      console.error('Error getting orders by date range:', error);
      throw error;
    }
  }
}
