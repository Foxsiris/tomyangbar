// API endpoint для получения всех блюд
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
