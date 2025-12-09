import { apiClient } from './apiClient.js';

// Сервис для работы с меню
export class MenuService {
  // Получение всех категорий
  static async getCategories() {
    try {
      const response = await apiClient.getCategories();
      return response.categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  // Получение всех блюд
  static async getDishes() {
    try {
      const response = await apiClient.getDishes();
      return response.dishes;
    } catch (error) {
      console.error('Error getting dishes:', error);
      throw error;
    }
  }

  // Получение блюд по категории
  static async getDishesByCategory(categoryId) {
    try {
      const response = await apiClient.getDishesByCategory(categoryId);
      return response.dishes;
    } catch (error) {
      console.error('Error getting dishes by category:', error);
      throw error;
    }
  }

  // Получение популярных блюд
  static async getPopularDishes() {
    try {
      const response = await apiClient.getPopularDishes();
      return response.dishes;
    } catch (error) {
      console.error('Error getting popular dishes:', error);
      throw error;
    }
  }

  // Получение блюда по ID
  static async getDishById(id) {
    try {
      const response = await apiClient.getDishById(id);
      return response.dish;
    } catch (error) {
      console.error('Error getting dish by ID:', error);
      throw error;
    }
  }

  // Поиск блюд
  static async searchDishes(query) {
    try {
      const response = await apiClient.searchDishes(query);
      return response.dishes;
    } catch (error) {
      console.error('Error searching dishes:', error);
      throw error;
    }
  }

  // Получение блюд с фильтрами
  static async getDishesWithFilters(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });
      
      const response = await apiClient.get(`/api/menu/dishes/filter?${queryParams.toString()}`);
      return response.dishes;
    } catch (error) {
      console.error('Error getting dishes with filters:', error);
      throw error;
    }
  }

  // Получение полного меню (категории + блюда)
  static async getFullMenu() {
    try {
      const response = await apiClient.getFullMenu();
      console.log('API response:', response); // Отладка
      // Бэкенд возвращает { menu: [...] }
      return response?.menu || response || [];
    } catch (error) {
      console.error('MenuService.getFullMenu: Error details:', error);
      console.error('MenuService.getFullMenu: Error message:', error?.message);
      console.error('MenuService.getFullMenu: Error stack:', error?.stack);
      throw error;
    }
  }

  // Получение статистики меню
  static async getMenuStats() {
    try {
      const response = await apiClient.get('/api/menu/stats');
      return response.stats;
    } catch (error) {
      console.error('Error getting menu stats:', error);
      throw error;
    }
  }

  // Обновление блюда (для админа)
  static async updateDish(dishId, updates) {
    try {
      const response = await apiClient.updateDish(dishId, updates);
      return response.dish;
    } catch (error) {
      console.error('Error updating dish:', error);
      throw error;
    }
  }

  // Создание блюда (для админа)
  static async createDish(dishData) {
    try {
      const response = await apiClient.createDish(dishData);
      return response.dish;
    } catch (error) {
      console.error('Error creating dish:', error);
      throw error;
    }
  }

  // Удаление блюда (для админа)
  static async deleteDish(dishId) {
    try {
      const response = await apiClient.deleteDish(dishId);
      return response;
    } catch (error) {
      console.error('Error deleting dish:', error);
      throw error;
    }
  }
}
