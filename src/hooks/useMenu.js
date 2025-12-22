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
      
      const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
      if (isDev) {
        console.log('useMenu.loadMenu: Menu data received:', data);
        console.log('useMenu.loadMenu: Data type:', typeof data);
        console.log('useMenu.loadMenu: Is array:', Array.isArray(data));
        console.log('useMenu.loadMenu: Has categories:', !!data?.categories);
        console.log('useMenu.loadMenu: Has dishes:', !!data?.dishes);
      }
      
      // Бэкенд может возвращать данные в разных форматах:
      // 1) { categories: [...], dishes: [...] }
      // 2) { menu: { categories: [...], dishes: [...] } }
      // 3) { menu: [...] } где каждый элемент - категория с dishes
      // 4) [...] (массив категорий с dishes)
      let categories = [];
      let dishes = [];
      
      if (data && typeof data === 'object') {
        // 2) { menu: { categories: [...], dishes: [...] } }
        if (data.menu && typeof data.menu === 'object' && !Array.isArray(data.menu)) {
          if (Array.isArray(data.menu.categories)) {
            categories = data.menu.categories.map(category => ({
              id: category.id,
              name: category.name,
              description: category.description,
              sort_order: category.sort_order,
              is_active: category.is_active
            }));
          }
          if (Array.isArray(data.menu.dishes)) {
            dishes = data.menu.dishes.map(dish => ({
              ...dish,
              image: dish.image_url || dish.image
            }));
          }
        }

        // 1) { categories: [...], dishes: [...] }
        if (Array.isArray(data.categories)) {
          categories = data.categories.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description,
            sort_order: category.sort_order,
            is_active: category.is_active
          }));
        }
        if (Array.isArray(data.dishes)) {
          dishes = data.dishes.map(dish => ({
            ...dish,
            image: dish.image_url || dish.image
          }));
        }

        // 3) { menu: [...] } где каждый элемент - категория с dishes
        if (data.menu && Array.isArray(data.menu)) {
          categories = [];
          dishes = [];
          data.menu.forEach(category => {
            categories.push({
              id: category.id,
              name: category.name,
              description: category.description,
              sort_order: category.sort_order,
              is_active: category.is_active
            });
            if (category.dishes && Array.isArray(category.dishes)) {
              category.dishes.forEach(dish => {
                dishes.push({
                  ...dish,
                  image: dish.image_url || dish.image
                });
              });
            }
          });
        }
      } else if (Array.isArray(data)) {
        // Старый формат - массив категорий с блюдами внутри
        console.warn('useMenu.loadMenu: Received array format (old format)');
        data.forEach(category => {
          categories.push({
            id: category.id,
            name: category.name,
            description: category.description,
            sort_order: category.sort_order,
            is_active: category.is_active
          });
          
          if (category.dishes && Array.isArray(category.dishes)) {
            category.dishes.forEach(dish => {
              dishes.push({
                ...dish,
                image: dish.image_url || dish.image
              });
            });
          }
        });
      } else {
        console.warn('useMenu.loadMenu: Unexpected data format:', data);
      }
      
      // Фильтруем блюда - показываем только те, которые в наличии (is_active: true)
      const availableDishes = dishes.filter(dish => dish.is_active !== false);
      
      // Фильтруем категории - показываем только активные
      const activeCategories = categories.filter(cat => cat.is_active !== false);
      
      if (isDev) {
        console.log('useMenu.loadMenu: Processed categories:', activeCategories.length, 'dishes:', availableDishes.length);
        console.log('useMenu.loadMenu: Hidden dishes (not in stock):', dishes.length - availableDishes.length);
      }
      setMenuData({ categories: activeCategories, dishes: availableDishes });
    } catch (err) {
      console.error('Error loading menu:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      // Устанавливаем более понятное сообщение об ошибке
      let errorMessage = 'Ошибка загрузки меню';
      if (err.message) {
        errorMessage = err.message;
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Не удалось подключиться к серверу. Проверьте подключение к интернету.';
      }
      
      setError(errorMessage);
      setMenuData({ categories: [], dishes: [] }); // Устанавливаем пустые данные при ошибке
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
