const express = require('express');
const supabase = require('../config/supabase');

const router = express.Router();

// Серверный кеш для меню (чтобы не обращаться к Supabase на каждый запрос)
let menuCache = { data: null, timestamp: 0 };
const MENU_CACHE_DURATION = 60000; // 1 минута

// Функция для сброса кеша (вызывается из adminRoutes при изменении меню)
const invalidateMenuCache = () => {
  menuCache = { data: null, timestamp: 0 };
};

// Получение всех блюд
router.get('/dishes', async (req, res) => {
  try {
    const { data: dishes, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Get dishes error:', error);
      return res.status(500).json({ error: 'Ошибка при получении блюд' });
    }

    res.json({ dishes });

  } catch (error) {
    console.error('Get dishes error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение категорий
router.get('/categories', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Get categories error:', error);
      return res.status(500).json({ error: 'Ошибка при получении категорий' });
    }

    res.json({ categories });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение полного меню (категории + блюда) — с серверным кешем
router.get('/full', async (req, res) => {
  try {
    // Проверяем серверный кеш
    if (menuCache.data && Date.now() - menuCache.timestamp < MENU_CACHE_DURATION) {
      res.set('X-Cache', 'HIT');
      return res.json(menuCache.data);
    }

    // Получаем категории
    let { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true);
    
    if (!categoriesError && categories) {
      categories.sort((a, b) => {
        const aOrder = a.sort_order ?? 999;
        const bOrder = b.sort_order ?? 999;
        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }
        return (a.name || '').localeCompare(b.name || '');
      });
    }

    if (categoriesError) {
      console.error('GET /menu/full error:', categoriesError.message);
      return res.status(500).json({ error: 'Ошибка при получении категорий', details: categoriesError.message });
    }

    // Получаем блюда
    const { data: dishes, error: dishesError } = await supabase
      .from('dishes')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (dishesError) {
      console.error('GET /menu/full error:', dishesError.message);
      return res.status(500).json({ error: 'Ошибка при получении блюд', details: dishesError.message });
    }

    const response = {
      menu: {
        categories: categories || [],
        dishes: dishes || []
      }
    };

    // Сохраняем в кеш
    menuCache = { data: response, timestamp: Date.now() };

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=60');
    res.json(response);

  } catch (error) {
    console.error('GET /menu/full error:', error.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера', details: error.message });
  }
});

module.exports = router;
module.exports.invalidateMenuCache = invalidateMenuCache;
