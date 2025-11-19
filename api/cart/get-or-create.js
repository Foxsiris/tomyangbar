// API endpoint для получения или создания корзины
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

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
