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
      
      const response = await apiClient.get(`/menu/dishes/filter?${queryParams.toString()}`);
      return response.dishes;
    } catch (error) {
      console.error('Error getting dishes with filters:', error);
      throw error;
    }
  }

  // Получение полного меню (категории + блюда)
  static async getFullMenu() {
    try {
      console.log('MenuService.getFullMenu: Starting request to /menu/full');
      const response = await apiClient.get('/menu/full');
      console.log('MenuService.getFullMenu: Raw response:', response);
      console.log('MenuService.getFullMenu: Response type:', typeof response);
      console.log('MenuService.getFullMenu: Response keys:', response ? Object.keys(response) : 'null');
      
      if (!response) {
        console.warn('MenuService.getFullMenu: Response is null or undefined');
        return {
          categories: [],
          dishes: []
        };
      }
      
      // Проверяем разные возможные форматы ответа
      let menuData = null;
      
      if (response.menu) {
        menuData = response.menu;
        console.log('MenuService.getFullMenu: Found menu in response.menu');
      } else if (response.categories && response.dishes) {
        menuData = response;
        console.log('MenuService.getFullMenu: Found categories and dishes directly in response');
      } else if (Array.isArray(response)) {
        // Если ответ - массив, возможно это старый формат
        console.warn('MenuService.getFullMenu: Response is array, converting...');
        menuData = {
          categories: [],
          dishes: []
        };
      } else {
        console.warn('MenuService.getFullMenu: Unknown response format:', response);
        return {
          categories: [],
          dishes: []
        };
      }
      
      console.log('MenuService.getFullMenu: Final menuData:', menuData);
      console.log('MenuService.getFullMenu: Categories count:', menuData?.categories?.length || 0);
      console.log('MenuService.getFullMenu: Dishes count:', menuData?.dishes?.length || 0);
      
      return menuData || {
        categories: [],
        dishes: []
      };
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
      const response = await apiClient.get('/menu/stats');
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
