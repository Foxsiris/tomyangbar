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

// Получение ВСЕХ блюд для админа (включая неактивные)
router.get('/menu/dishes', async (req, res) => {
  try {
    const { data: dishes, error } = await supabase
      .from('dishes')
      .select('*')
      .order('name');

    if (error) {
      console.error('Get all dishes error:', error);
      return res.status(500).json({ error: 'Ошибка при получении блюд' });
    }

    res.json({ dishes });

  } catch (error) {
    console.error('Get all dishes error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение ВСЕХ категорий для админа (включая неактивные)
router.get('/menu/categories', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Get all categories error:', error);
      return res.status(500).json({ error: 'Ошибка при получении категорий' });
    }

    res.json({ categories });

  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

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

// Создание категории
router.post('/menu/categories', async (req, res) => {
  try {
    const categoryData = req.body;

    // Проверяем обязательные поля
    if (!categoryData.name) {
      return res.status(400).json({ error: 'Название категории обязательно' });
    }

    // Генерируем ID, если не указан или пустой
    let categoryId = categoryData.id;
    // Убираем пробелы и проверяем на пустоту
    if (categoryId) {
      categoryId = categoryId.trim();
    }
    if (!categoryId || categoryId === '') {
      // Генерируем ID из названия (транслитерация кириллицы)
      const cyrillicToLatin = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
        'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
        'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
      };
      
      let transliterated = categoryData.name.toLowerCase();
      for (const [cyr, lat] of Object.entries(cyrillicToLatin)) {
        transliterated = transliterated.replace(new RegExp(cyr, 'g'), lat);
      }
      
      categoryId = transliterated
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .substring(0, 50);
      
      // Если после всех преобразований ID пустой — генерируем случайный
      if (!categoryId || categoryId === '' || categoryId === '-') {
        categoryId = 'category-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
      }
      
      // Проверяем уникальность ID
      let finalId = categoryId;
      let counter = 1;
      let exists = true;
      
      while (exists && counter < 100) {
        const { data: existing } = await supabase
          .from('categories')
          .select('id')
          .eq('id', finalId)
          .single();
        
        if (existing) {
          finalId = `${categoryId}-${counter}`;
          counter++;
        } else {
          exists = false;
        }
      }
      
      categoryId = finalId;
    }

    // Устанавливаем sort_order, если не указан
    let sortOrder = categoryData.sort_order;
    if (sortOrder === undefined || sortOrder === null) {
      const { data: maxCategory } = await supabase
        .from('categories')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single();
      
      sortOrder = maxCategory ? (maxCategory.sort_order + 1) : 0;
    }

    const insertData = {
      id: categoryId,
      name: categoryData.name,
      description: categoryData.description || null,
      sort_order: sortOrder,
      is_active: categoryData.is_active !== undefined ? categoryData.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Create category error:', error);
      return res.status(500).json({ error: `Ошибка при создании категории: ${error.message}` });
    }

    // Убеждаемся, что ID присутствует в ответе
    if (!newCategory || !newCategory.id) {
      console.error('Category created but no ID returned:', newCategory);
      return res.status(500).json({ error: 'Категория создана, но ID не был возвращен' });
    }

    res.status(201).json({ 
      message: 'Категория успешно создана',
      category: newCategory 
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Обновление категории
router.put('/menu/categories/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const updates = req.body;

    const { data: updatedCategory, error } = await supabase
      .from('categories')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      console.error('Update category error:', error);
      return res.status(500).json({ error: 'Ошибка при обновлении категории' });
    }

    res.json({ 
      message: 'Категория успешно обновлена',
      category: updatedCategory 
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Удаление категории
router.delete('/menu/categories/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Проверяем, есть ли блюда в этой категории
    const { data: dishes, error: dishesError } = await supabase
      .from('dishes')
      .select('id')
      .eq('category_id', categoryId)
      .limit(1);

    if (dishesError) {
      console.error('Check dishes error:', dishesError);
      return res.status(500).json({ error: 'Ошибка при проверке блюд' });
    }

    if (dishes && dishes.length > 0) {
      return res.status(400).json({ 
        error: 'Невозможно удалить категорию, так как в ней есть блюда. Сначала удалите или переместите блюда.' 
      });
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Delete category error:', error);
      return res.status(500).json({ error: 'Ошибка при удалении категории' });
    }

    res.json({ message: 'Категория успешно удалена' });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;
