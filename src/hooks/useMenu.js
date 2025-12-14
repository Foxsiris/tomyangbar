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
      
      console.log('Menu data received:', data); // Отладка
      
      // Бэкенд может возвращать данные в разных форматах:
      // 1. { menu: { categories: [], dishes: [] } }
      // 2. { menu: [...] } где каждый элемент - категория с dishes
      // 3. Массив категорий
      let categories = [];
      let dishes = [];
      
      if (data && typeof data === 'object') {
        // Формат { menu: { categories: [], dishes: [] } }
        if (data.menu && data.menu.categories && Array.isArray(data.menu.categories)) {
          categories = data.menu.categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            sort_order: cat.sort_order,
            is_active: cat.is_active
          }));
        }
        
        if (data.menu && data.menu.dishes && Array.isArray(data.menu.dishes)) {
          dishes = data.menu.dishes.map(dish => ({
            ...dish,
            image: dish.image_url || dish.image // Преобразуем image_url в image для совместимости
          }));
        }
        
        // Формат { menu: [...] } где каждый элемент - категория с dishes
        if (data.menu && Array.isArray(data.menu) && !data.menu.categories) {
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
        
        // Если data - массив категорий
        if (Array.isArray(data)) {
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
        }
      }
      
      console.log('Processed categories:', categories.length, 'dishes:', dishes.length); // Отладка
      setMenuData({ categories, dishes });
    } catch (err) {
      console.error('Error loading menu:', err);
      setError(err.message || 'Ошибка загрузки меню');
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
