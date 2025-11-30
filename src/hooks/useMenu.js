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
      console.log('useMenu.loadMenu: Starting menu load');
      setIsLoading(true);
      setError(null);
      
      const data = await MenuService.getFullMenu();
      
      console.log('useMenu.loadMenu: Data received from service:', data);
      console.log('useMenu.loadMenu: Data type:', typeof data);
      console.log('useMenu.loadMenu: Data keys:', data ? Object.keys(data) : 'null');
      
      // Проверяем, что данные есть
      if (!data) {
        console.warn('useMenu.loadMenu: No data received');
        setMenuData({ categories: [], dishes: [] });
        return;
      }
      
      // Преобразуем данные из формата API в ожидаемый формат
      const categories = Array.isArray(data.categories) 
        ? data.categories.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description,
            sort_order: category.sort_order,
            is_active: category.is_active
          }))
        : [];
      
      const dishes = Array.isArray(data.dishes)
        ? data.dishes.map(dish => ({
            ...dish,
            image: dish.image_url || dish.image // Преобразуем image_url в image для совместимости
          }))
        : [];
      
      console.log('useMenu.loadMenu: Processed categories:', categories.length);
      console.log('useMenu.loadMenu: Processed dishes:', dishes.length);
      console.log('useMenu.loadMenu: Sample category:', categories[0]);
      console.log('useMenu.loadMenu: Sample dish:', dishes[0]);
      
      setMenuData({ categories, dishes });
      console.log('useMenu.loadMenu: Menu data set successfully');
    } catch (err) {
      console.error('useMenu.loadMenu: Error loading menu:', err);
      console.error('useMenu.loadMenu: Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(err.message || 'Ошибка при загрузке меню');
      // Устанавливаем пустые данные при ошибке
      setMenuData({ categories: [], dishes: [] });
    } finally {
      setIsLoading(false);
      console.log('useMenu.loadMenu: Loading completed');
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
