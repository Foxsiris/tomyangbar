// API endpoint для получения полного меню (категории + блюда)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

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
