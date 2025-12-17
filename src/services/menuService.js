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
      const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
      if (isDev) {
        console.log('MenuService.getFullMenu: API response:', response);
      }
      
      // Бэкенд возвращает { menu: { categories: [...], dishes: [...] } }
      if (response?.menu) {
        // Если есть menu объект, возвращаем его
        return response.menu;
      } else if (response?.categories && response?.dishes) {
        // Если categories и dishes на верхнем уровне
        return response;
      } else if (Array.isArray(response)) {
        // Если массив (старый формат)
        return { categories: [], dishes: [] };
      } else {
        // Fallback
        console.warn('MenuService.getFullMenu: Unexpected response format:', response);
        return { categories: [], dishes: [] };
      }
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

  // Создание категории (для админа)
  static async createCategory(categoryData) {
    try {
      const response = await apiClient.createCategory(categoryData);
      return response.category;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Обновление категории (для админа)
  static async updateCategory(categoryId, updates) {
    try {
      const response = await apiClient.updateCategory(categoryId, updates);
      return response.category;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  // Удаление категории (для админа)
  static async deleteCategory(categoryId) {
    try {
      const response = await apiClient.deleteCategory(categoryId);
      return response;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
}
