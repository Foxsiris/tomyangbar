// Единый API endpoint для всех запросов
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { path, action } = req.query;

    // Маршрутизация запросов
    switch (path) {
      case 'menu':
        return await handleMenu(req, res, action);
      case 'cart':
        return await handleCart(req, res, action);
      default:
        return res.status(404).json({ error: 'Endpoint not found' });
    }

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Обработка запросов к меню
async function handleMenu(req, res, action) {
  switch (action) {
    case 'dishes':
      return await getDishes(req, res);
    case 'categories':
      return await getCategories(req, res);
    case 'full':
      return await getFullMenu(req, res);
    default:
      return res.status(404).json({ error: 'Menu action not found' });
  }
}

// Обработка запросов к корзине
async function handleCart(req, res, action) {
  switch (action) {
    case 'get-or-create':
      return await getOrCreateCart(req, res);
    default:
      return res.status(404).json({ error: 'Cart action not found' });
  }
}

// Получение всех блюд
async function getDishes(req, res) {
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
}

// Получение категорий
async function getCategories(req, res) {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Get categories error:', error);
      return res.status(500).json({ error: 'Ошибка при получении категорий' });
    }

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
}

// Получение полного меню
async function getFullMenu(req, res) {
  try {
    // Получаем категории
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

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

    const menu = {
      categories: categories || [],
      dishes: dishes || []
    };

    res.json({ menu });
  } catch (error) {
    console.error('Get full menu error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
}

// Получение или создание корзины
async function getOrCreateCart(req, res) {
  try {
    const { sessionId } = req.body || {};

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Ищем существующую корзину
    const { data: existingCart, error: findError } = await supabase
      .from('carts')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      console.error('Find cart error:', findError);
      return res.status(500).json({ error: 'Ошибка при поиске корзины' });
    }

    if (existingCart) {
      return res.json({ cart: existingCart });
    }

    // Создаем новую корзину
    const { data: newCart, error: createError } = await supabase
      .from('carts')
      .insert({
        session_id: sessionId,
        items: [],
        total: 0
      })
      .select()
      .single();

    if (createError) {
      console.error('Create cart error:', createError);
      return res.status(500).json({ error: 'Ошибка при создании корзины' });
    }

    res.json({ cart: newCart });
  } catch (error) {
    console.error('Cart operation error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
}