import { supabase } from '../config/supabase.js';

// Сервис для работы с меню
export class MenuService {
  // Получение всех категорий
  static async getCategories() {
    try {
      console.log('🔍 Загружаем категории из Supabase...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('❌ Ошибка при загрузке категорий:', error);
        throw error;
      }
      
      console.log('✅ Категории загружены:', data);
      return data;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  // Получение всех блюд
  static async getDishes() {
    try {
      console.log('🔍 Загружаем блюда из Supabase...');
      const { data, error } = await supabase
        .from('dishes')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('❌ Ошибка при загрузке блюд:', error);
        throw error;
      }
      
      console.log('✅ Блюда загружены:', data);
      return data;
    } catch (error) {
      console.error('Error getting dishes:', error);
      throw error;
    }
  }

  // Получение блюд по категории
  static async getDishesByCategory(categoryId) {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting dishes by category:', error);
      throw error;
    }
  }

  // Получение популярных блюд
  static async getPopularDishes() {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `)
        .eq('is_popular', true)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting popular dishes:', error);
      throw error;
    }
  }

  // Получение блюда по ID
  static async getDishById(id) {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting dish by ID:', error);
      throw error;
    }
  }

  // Поиск блюд
  static async searchDishes(query) {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching dishes:', error);
      throw error;
    }
  }

  // Получение блюд с фильтрами
  static async getDishesWithFilters(filters = {}) {
    try {
      let query = supabase
        .from('dishes')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `)
        .eq('is_active', true);

      // Фильтр по категории
      if (filters.category) {
        query = query.eq('category_id', filters.category);
      }

      // Фильтр по популярности
      if (filters.popular !== undefined) {
        query = query.eq('is_popular', filters.popular);
      }

      // Фильтр по остроте
      if (filters.spicy !== undefined) {
        query = query.eq('is_spicy', filters.spicy);
      }

      // Фильтр по вегетарианству
      if (filters.vegetarian !== undefined) {
        query = query.eq('is_vegetarian', filters.vegetarian);
      }

      // Фильтр по цене
      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      // Сортировка
      const sortBy = filters.sortBy || 'sort_order';
      const sortOrder = filters.sortOrder || 'asc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting dishes with filters:', error);
      throw error;
    }
  }

  // Получение полного меню (категории + блюда)
  static async getFullMenu() {
    try {
      const [categories, dishes] = await Promise.all([
        this.getCategories(),
        this.getDishes()
      ]);

      // Группируем блюда по категориям
      const menuData = {
        categories: categories,
        dishes: dishes
      };

      return menuData;
    } catch (error) {
      console.error('Error getting full menu:', error);
      throw error;
    }
  }

  // Получение статистики меню
  static async getMenuStats() {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select('category_id, is_popular, is_spicy, is_vegetarian, price')
        .eq('is_active', true);

      if (error) throw error;

      const stats = {
        totalDishes: data.length,
        popularDishes: data.filter(dish => dish.is_popular).length,
        spicyDishes: data.filter(dish => dish.is_spicy).length,
        vegetarianDishes: data.filter(dish => dish.is_vegetarian).length,
        averagePrice: data.reduce((sum, dish) => sum + parseFloat(dish.price), 0) / data.length,
        categoriesCount: new Set(data.map(dish => dish.category_id)).size
      };

      return stats;
    } catch (error) {
      console.error('Error getting menu stats:', error);
      throw error;
    }
  }
}
