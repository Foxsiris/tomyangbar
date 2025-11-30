const express = require('express');
const supabase = require('../config/supabase');

const router = express.Router();

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

// Получение полного меню (категории + блюда)
router.get('/full', async (req, res) => {
  try {
    console.log('GET /menu/full: Request received');
    
    // Получаем категории
    console.log('GET /menu/full: Fetching categories...');
    let { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true);
    
    console.log('GET /menu/full: Categories result:', {
      count: categories?.length || 0,
      error: categoriesError,
      sample: categories?.[0]
    });
    
    if (!categoriesError && categories) {
      // Сортируем категории: сначала по sort_order, потом по name
      categories.sort((a, b) => {
        const aOrder = a.sort_order ?? 999;
        const bOrder = b.sort_order ?? 999;
        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }
        return (a.name || '').localeCompare(b.name || '');
      });
      console.log('GET /menu/full: Categories sorted');
    }

    if (categoriesError) {
      console.error('GET /menu/full: Get categories error:', categoriesError);
      return res.status(500).json({ error: 'Ошибка при получении категорий', details: categoriesError.message });
    }

    // Получаем блюда
    console.log('GET /menu/full: Fetching dishes...');
    const { data: dishes, error: dishesError } = await supabase
      .from('dishes')
      .select('*')
      .eq('is_active', true)
      .order('name');

    console.log('GET /menu/full: Dishes result:', {
      count: dishes?.length || 0,
      error: dishesError,
      sample: dishes?.[0]
    });

    if (dishesError) {
      console.error('GET /menu/full: Get dishes error:', dishesError);
      return res.status(500).json({ error: 'Ошибка при получении блюд', details: dishesError.message });
    }

    // Возвращаем плоскую структуру: категории и блюда отдельно
    const menu = {
      categories: categories || [],
      dishes: dishes || []
    };

    console.log('GET /menu/full: Sending response:', {
      categoriesCount: menu.categories.length,
      dishesCount: menu.dishes.length
    });

    res.json({ menu });

  } catch (error) {
    console.error('GET /menu/full: Get full menu error:', error);
    console.error('GET /menu/full: Error stack:', error.stack);
    res.status(500).json({ error: 'Внутренняя ошибка сервера', details: error.message });
  }
});

module.exports = router;
