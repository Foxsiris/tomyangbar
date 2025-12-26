const express = require('express');
const supabase = require('../config/supabase');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Публичный endpoint для получения активных новостей
router.get('/', async (req, res) => {
  try {
    const { type, limit } = req.query;

    let query = supabase
      .from('news')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: news, error } = await query;

    if (error) {
      console.error('Get news error:', error);
      return res.status(500).json({ error: 'Ошибка при получении новостей' });
    }

    res.json({ news: news || [] });

  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение всех новостей для админа (включая неактивные)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type } = req.query;

    let query = supabase
      .from('news')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data: news, error } = await query;

    if (error) {
      console.error('Get all news error:', error);
      return res.status(500).json({ error: 'Ошибка при получении новостей' });
    }

    res.json({ news: news || [] });

  } catch (error) {
    console.error('Get all news error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение одной новости
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: newsItem, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Get news item error:', error);
      return res.status(500).json({ error: 'Ошибка при получении новости' });
    }

    if (!newsItem) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }

    res.json({ news: newsItem });

  } catch (error) {
    console.error('Get news item error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Создание новости (только для админа)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      image_url,
      type = 'news',
      dish_id,
      link_url,
      is_active = true,
      sort_order = 0
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Заголовок обязателен' });
    }

    const { data: newsItem, error } = await supabase
      .from('news')
      .insert([{
        title,
        description: description || null,
        image_url: image_url || null,
        type,
        dish_id: dish_id || null,
        link_url: link_url || null,
        is_active,
        sort_order: parseInt(sort_order) || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Create news error:', error);
      return res.status(500).json({ error: 'Ошибка при создании новости' });
    }

    res.status(201).json({
      message: 'Новость успешно создана',
      news: newsItem
    });

  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Обновление новости (только для админа)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Преобразуем sort_order в число, если он есть
    if (updates.sort_order !== undefined) {
      updates.sort_order = parseInt(updates.sort_order) || 0;
    }

    const { data: newsItem, error } = await supabase
      .from('news')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update news error:', error);
      return res.status(500).json({ error: 'Ошибка при обновлении новости' });
    }

    res.json({
      message: 'Новость успешно обновлена',
      news: newsItem
    });

  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Удаление новости (только для админа)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete news error:', error);
      return res.status(500).json({ error: 'Ошибка при удалении новости' });
    }

    res.json({ message: 'Новость успешно удалена' });

  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;

