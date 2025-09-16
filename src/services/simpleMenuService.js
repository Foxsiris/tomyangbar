import { supabase } from '../config/supabase.js';

// Упрощенный сервис для работы с меню
export class SimpleMenuService {
  // Получение всех категорий
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  // Получение всех блюд
  static async getDishes() {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting dishes:', error);
      return [];
    }
  }

  // Получение полного меню
  static async getFullMenu() {
    try {
      const [categories, dishes] = await Promise.all([
        this.getCategories(),
        this.getDishes()
      ]);

      return {
        categories: categories || [],
        dishes: dishes || []
      };
    } catch (error) {
      console.error('Error getting full menu:', error);
      return {
        categories: [],
        dishes: []
      };
    }
  }
}
