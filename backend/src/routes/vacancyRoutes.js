const express = require('express');
const supabase = require('../config/supabase');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Публичный endpoint для создания заявки на вакансию
router.post('/', async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      middle_name,
      age,
      work_experience,
      phone,
      specialty
    } = req.body;

    // Валидация обязательных полей
    if (!first_name || !last_name || !age || !work_experience || !phone || !specialty) {
      return res.status(400).json({
        error: 'Все обязательные поля должны быть заполнены',
        required: ['first_name', 'last_name', 'age', 'work_experience', 'phone', 'specialty']
      });
    }

    // Валидация возраста
    if (age < 16 || age > 100) {
      return res.status(400).json({ error: 'Возраст должен быть от 16 до 100 лет' });
    }

    // Валидация стажа
    if (work_experience < 0) {
      return res.status(400).json({ error: 'Стаж работы не может быть отрицательным' });
    }

    // Валидация телефона (базовая проверка)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Неверный формат телефона' });
    }

    // Создаем заявку
    const { data: vacancy, error } = await supabase
      .from('vacancies')
      .insert([{
        first_name,
        last_name,
        middle_name: middle_name || null,
        age: parseInt(age),
        work_experience: parseInt(work_experience),
        phone,
        specialty,
        status: 'new',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Create vacancy error:', error);
      return res.status(500).json({ error: 'Ошибка при создании заявки' });
    }

    res.status(201).json({
      message: 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.',
      vacancy
    });

  } catch (error) {
    console.error('Create vacancy error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение всех заявок (только для админа)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('vacancies')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: vacancies, error } = await query;

    if (error) {
      console.error('Get vacancies error:', error);
      return res.status(500).json({ error: 'Ошибка при получении заявок' });
    }

    res.json({ vacancies });

  } catch (error) {
    console.error('Get vacancies error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Обновление статуса заявки (только для админа)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Статус обязателен' });
    }

    const validStatuses = ['new', 'viewed', 'contacted', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Неверный статус' });
    }

    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { data: vacancy, error } = await supabase
      .from('vacancies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update vacancy status error:', error);
      return res.status(500).json({ error: 'Ошибка при обновлении статуса' });
    }

    res.json({
      message: 'Статус успешно обновлен',
      vacancy
    });

  } catch (error) {
    console.error('Update vacancy status error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение одной заявки (только для админа)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: vacancy, error } = await supabase
      .from('vacancies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Get vacancy error:', error);
      return res.status(500).json({ error: 'Ошибка при получении заявки' });
    }

    if (!vacancy) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }

    res.json({ vacancy });

  } catch (error) {
    console.error('Get vacancy error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;

