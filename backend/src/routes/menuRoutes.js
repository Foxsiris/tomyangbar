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
    // Получаем категории
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (categoriesError) {
      console.error('Get categories error:', categoriesError);
      return res.status(500).json({ error: 'Ошибка при получении категорий' });
    }

    // Получаем блюда
    const { data: dishes, error: dishesError } = await supabase
      .from('dishes')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (dishesError) {
      console.error('Get dishes error:', dishesError);
      return res.status(500).json({ error: 'Ошибка при получении блюд' });
    }

    // Группируем блюда по категориям
    const menu = categories.map(category => ({
      ...category,
      dishes: dishes.filter(dish => dish.category_id === category.id)
    }));

    res.json({ menu });

  } catch (error) {
    console.error('Get full menu error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;
