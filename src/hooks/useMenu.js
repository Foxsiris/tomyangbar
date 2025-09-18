import { useState, useEffect, useCallback } from 'react';
import { MenuService } from '../services/menuService.js';

export const useMenu = () => {
  const [menuData, setMenuData] = useState({
    categories: [],
    dishes: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загружаем полное меню
  const loadMenu = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await MenuService.getFullMenu();
      
      // Преобразуем данные из формата API в ожидаемый формат
      const categories = (data.categories || []).map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        sort_order: category.sort_order,
        is_active: category.is_active
      }));
      
      const dishes = (data.dishes || []).map(dish => ({
        ...dish,
        image: dish.image_url // Преобразуем image_url в image для совместимости
      }));
      
      setMenuData({ categories, dishes });
    } catch (err) {
      console.error('Error loading menu:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Загружаем меню при инициализации
  useEffect(() => {
    loadMenu();
  }, [loadMenu]);


  // Получение блюд по категории
  const getDishesByCategory = useCallback((categoryId) => {
    return (menuData.dishes || []).filter(dish => dish.category_id === categoryId);
  }, [menuData.dishes]);

  // Получение популярных блюд
  const getPopularDishes = useCallback(() => {
    return (menuData.dishes || []).filter(dish => dish.is_popular);
  }, [menuData.dishes]);

  // Поиск блюд
  const searchDishes = useCallback(async (query) => {
    if (!query.trim()) return [];
    
    try {
      return await MenuService.searchDishes(query);
    } catch (err) {
      console.error('Error searching dishes:', err);
      return [];
    }
  }, []);

  // Получение блюда по ID
  const getDishById = useCallback((id) => {
    return (menuData.dishes || []).find(dish => dish.id === id);
  }, [menuData.dishes]);

  // Фильтрация блюд
  const filterDishes = useCallback(async (filters) => {
    try {
      return await MenuService.getDishesWithFilters(filters);
    } catch (err) {
      console.error('Error filtering dishes:', err);
      return [];
    }
  }, []);

  // Получение категории по ID
  const getCategoryById = useCallback((id) => {
    return (menuData.categories || []).find(category => category.id === id);
  }, [menuData.categories]);

  // Обновление меню
  const refreshMenu = useCallback(() => {
    loadMenu();
  }, [loadMenu]);

  return {
    menuData,
    isLoading,
    error,
    getDishesByCategory,
    getPopularDishes,
    searchDishes,
    getDishById,
    filterDishes,
    getCategoryById,
    refreshMenu
  };
};
