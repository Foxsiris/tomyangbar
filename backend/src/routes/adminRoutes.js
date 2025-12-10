const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const supabase = require('../config/supabase');

const router = express.Router();

// Настройка multer для загрузки изображений
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'dish-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены'), false);
    }
  }
});

// Все маршруты админа требуют аутентификации и админских прав
router.use(authenticateToken);
router.use(requireAdmin);

// Получение всех заказов
router.get('/orders', getAllOrders);

// Обновление статуса заказа
router.patch('/orders/:orderId/status', updateOrderStatus);

// Загрузка изображения
router.post('/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл изображения не предоставлен' });
    }

    // Возвращаем URL изображения
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'Изображение успешно загружено',
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке изображения' });
  }
});

// Обновление блюда
router.put('/menu/dishes/:dishId', async (req, res) => {
  try {
    const { dishId } = req.params;
    const updates = req.body;

    const { data: updatedDish, error } = await supabase
      .from('dishes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', dishId)
      .select()
      .single();

    if (error) {
      console.error('Update dish error:', error);
      return res.status(500).json({ error: 'Ошибка при обновлении блюда' });
    }

    res.json({ 
      message: 'Блюдо успешно обновлено',
      dish: updatedDish 
    });

  } catch (error) {
    console.error('Update dish error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Создание блюда
router.post('/menu/dishes', async (req, res) => {
  try {
    const dishData = req.body;

    const { data: newDish, error } = await supabase
      .from('dishes')
      .insert([{
        ...dishData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Create dish error:', error);
      return res.status(500).json({ error: 'Ошибка при создании блюда' });
    }

    res.status(201).json({ 
      message: 'Блюдо успешно создано',
      dish: newDish 
    });

  } catch (error) {
    console.error('Create dish error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Удаление блюда
router.delete('/menu/dishes/:dishId', async (req, res) => {
  try {
    const { dishId } = req.params;

    const { error } = await supabase
      .from('dishes')
      .delete()
      .eq('id', dishId);

    if (error) {
      console.error('Delete dish error:', error);
      return res.status(500).json({ error: 'Ошибка при удалении блюда' });
    }

    res.json({ message: 'Блюдо успешно удалено' });

  } catch (error) {
    console.error('Delete dish error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;
