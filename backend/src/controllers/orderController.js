const supabase = require('../config/supabase');
const iikoService = require('../services/iikoService');
const { LOYALTY_CONFIG, calculateLoyaltyLevel, getCashbackPercent } = require('./userController');

// Хелпер для получения total_spent пользователя
const getUserTotalSpent = async (userId) => {
  const { data } = await supabase
    .from('users')
    .select('total_spent')
    .eq('id', userId)
    .single();
  return data?.total_spent || 0;
};

// Создание заказа
const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      email,
      address,
      items,
      total,
      deliveryType,
      deliveryTime,
      paymentMethod,
      cashAmount = 0,
      changeAmount = 0,
      notes,
      bonusesToUse = 0 // Количество бонусов для списания
    } = req.body;

    let userId = req.user ? req.user.userId : null;
    let userBonusBalance = 0;
    let userLoyaltyLevel = 'bronze';
    let actualBonusesToUse = 0;

    // Проверяем, существует ли пользователь в таблице users (для foreign key)
    if (userId) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, bonus_balance, loyalty_level, total_spent')
        .eq('id', userId)
        .single();
      
      if (!existingUser) {
        console.log('User not found in users table, setting userId to null:', userId);
        userId = null;
      } else {
        userBonusBalance = existingUser.bonus_balance || 0;
        userLoyaltyLevel = existingUser.loyalty_level || 'bronze';
        
        // Проверяем, сколько бонусов можно использовать
        // Максимум - 100% от суммы заказа или весь баланс
        const maxBonusesToUse = Math.min(userBonusBalance, Math.floor(total));
        actualBonusesToUse = Math.min(bonusesToUse, maxBonusesToUse);
        
        if (actualBonusesToUse < 0) actualBonusesToUse = 0;
        
        console.log('💰 Бонусы:', {
          запрошено: bonusesToUse,
          доступно: userBonusBalance,
          максимум: maxBonusesToUse,
          будетСписано: actualBonusesToUse
        });
      }
    }

    // Логируем для отладки (включая неавторизованных пользователей)
    console.log('Creating order:', {
      hasUser: !!req.user,
      userId: userId,
      customerName,
      email,
      itemsCount: items?.length || 0,
      total
    });

    // Генерируем номер заказа - получаем следующий порядковый номер
    const { data: lastOrders, error: lastOrderError } = await supabase
      .from('orders')
      .select('order_number')
      .order('order_number', { ascending: false })
      .limit(1);
    
    // Если заказов нет или ошибка, начинаем с 1
    const orderNumber = (lastOrders && lastOrders.length > 0 && lastOrders[0]?.order_number)
      ? lastOrders[0].order_number + 1
      : 1;
    
    // Валидация обязательных полей
    if (!customerName || !phone || !email || !items || items.length === 0 || !total) {
      console.error('Missing required fields:', { customerName, phone, email, items, total });
      return res.status(400).json({ error: 'Неполные данные заказа' });
    }

    // Рассчитываем итоговую сумму с учетом бонусов
    const deliveryFee = deliveryType === 'delivery' ? 200 : 0;
    const subtotal = total + deliveryFee;
    const finalTotal = subtotal - actualBonusesToUse;
    
    // Рассчитываем бонусы за заказ (только для авторизованных пользователей)
    // Бонусы начисляются от суммы БЕЗ использованных бонусов
    const cashbackPercent = getCashbackPercent(userLoyaltyLevel);
    const bonusesToEarn = userId ? Math.floor((total - actualBonusesToUse) * cashbackPercent / 100) : 0;

    // Создаем заказ
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: customerName,
          phone,
          email,
          address: address,
          total: total,
          delivery_fee: deliveryFee,
          final_total: finalTotal,
          bonuses_used: actualBonusesToUse,
          bonuses_earned: bonusesToEarn,
          status: 'pending',
          delivery_type: deliveryType,
          delivery_time: deliveryTime,
          payment_method: paymentMethod,
          cash_amount: paymentMethod === 'cash' ? cashAmount : 0,
          change_amount: paymentMethod === 'cash' ? changeAmount : 0,
          notes: notes || '',
          user_id: userId,
          order_number: orderNumber,
          created_at: new Date().toISOString()
        }
      ])
      .select('id, order_number, customer_name, status, final_total, bonuses_used, bonuses_earned, created_at')
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      console.error('Order data:', {
        customer_name: customerName,
        phone,
        email,
        address: address || (deliveryType === 'pickup' ? 'Самовывоз' : ''),
        total: parseFloat(total),
        delivery_fee: deliveryType === 'delivery' ? 200 : 0,
        final_total: parseFloat(total) + (deliveryType === 'delivery' ? 200 : 0),
        status: 'pending',
        delivery_type: deliveryType,
        delivery_time: deliveryTime,
        payment_method: paymentMethod,
        notes: notes || '',
        user_id: userId,
        order_number: orderNumber
      });
      return res.status(500).json({
        error: 'Ошибка при создании заказа',
        details: orderError.message,
        code: orderError.code,
        hint: orderError.hint
      });
    }

    // Получаем iiko_product_id для всех блюд в заказе
    const dishIds = items.map(item => item.dish_id || item.id).filter(Boolean);
    let iikoProductIds = {};
    
    if (dishIds.length > 0) {
      const { data: dishesWithIiko } = await supabase
        .from('dishes')
        .select('id, iiko_product_id')
        .in('id', dishIds);
      
      if (dishesWithIiko) {
        dishesWithIiko.forEach(dish => {
          if (dish.iiko_product_id) {
            iikoProductIds[dish.id] = dish.iiko_product_id;
          }
        });
      }
    }

    // Создаем элементы заказа с более детальной обработкой
    const orderItems = items.map((item, index) => {
      const dishId = item.dish_id || item.id;
      const dishName = item.dish_name || item.name;
      const quantity = parseInt(item.quantity) || 1;
      const price = parseFloat(item.price) || 0;

      // Логируем каждый элемент для отладки
      if (!dishId || !dishName || !price || price <= 0) {
        console.error(`Invalid item at index ${index}:`, {
          original: item,
          processed: { dishId, dishName, quantity, price }
        });
      }

      return {
        order_id: newOrder.id,
        dish_id: dishId,
        dish_name: dishName,
        quantity: quantity,
        price: price,
        iiko_product_id: iikoProductIds[dishId] || null
      };
    });

    // Логируем для отладки
    console.log('Order items:', JSON.stringify(orderItems, null, 2));
    console.log('Original items:', JSON.stringify(items, null, 2));

    // Проверяем, что все элементы валидны
    const invalidItems = orderItems.filter(item => {
      const isInvalid = !item.dish_id || !item.dish_name || !item.price || item.price <= 0;
      if (isInvalid) {
        console.error('Invalid item found:', item);
      }
      return isInvalid;
    });

    if (invalidItems.length > 0) {
      console.error('Invalid order items:', invalidItems);
      await supabase.from('orders').delete().eq('id', newOrder.id);
      return res.status(400).json({
        error: 'Некорректные данные элементов заказа',
        details: `Найдено ${invalidItems.length} невалидных элементов`,
        invalidItems: invalidItems
      });
    }

    // Для вставки в БД убираем iiko_product_id (этой колонки нет в order_items)
    const orderItemsForDb = orderItems.map(({ iiko_product_id, ...rest }) => rest);
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsForDb);

    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      // Удаляем заказ, если не удалось создать элементы
      await supabase.from('orders').delete().eq('id', newOrder.id);
      return res.status(500).json({ error: 'Ошибка при создании элементов заказа' });
    }

    // === Обработка бонусов ===
    if (userId) {
      const newBonusBalance = userBonusBalance - actualBonusesToUse + bonusesToEarn;
      const newTotalSpent = (parseFloat(await getUserTotalSpent(userId)) || 0) + (total - actualBonusesToUse);
      const newLoyaltyLevel = calculateLoyaltyLevel(newTotalSpent);

      // Обновляем баланс пользователя
      const { error: updateError } = await supabase
        .from('users')
        .update({
          bonus_balance: newBonusBalance,
          total_spent: newTotalSpent,
          loyalty_level: newLoyaltyLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user bonuses:', updateError);
      } else {
        // Записываем транзакции бонусов
        const transactions = [];
        
        // Списание бонусов
        if (actualBonusesToUse > 0) {
          transactions.push({
            user_id: userId,
            order_id: newOrder.id,
            amount: -actualBonusesToUse,
            type: 'order_payment',
            description: `Оплата заказа #${newOrder.order_number}`,
            balance_after: userBonusBalance - actualBonusesToUse
          });
        }
        
        // Начисление бонусов
        if (bonusesToEarn > 0) {
          transactions.push({
            user_id: userId,
            order_id: newOrder.id,
            amount: bonusesToEarn,
            type: 'order_cashback',
            description: `Кэшбэк ${cashbackPercent}% за заказ #${newOrder.order_number}`,
            balance_after: newBonusBalance
          });
        }
        
        if (transactions.length > 0) {
          await supabase.from('bonus_transactions').insert(transactions);
        }

        console.log('');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('💎 СИСТЕМА ЛОЯЛЬНОСТИ');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('👤 Пользователь:', customerName);
        console.log('🏆 Уровень:', userLoyaltyLevel, '→', newLoyaltyLevel);
        console.log('💰 Использовано бонусов:', actualBonusesToUse);
        console.log('🎁 Начислено бонусов:', bonusesToEarn, `(${cashbackPercent}%)`);
        console.log('💳 Новый баланс:', newBonusBalance);
        console.log('📊 Общая сумма покупок:', newTotalSpent, '₽');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');
      }
    }

    // === Отправка заказа в iiko ===
    let iikoOrderId = null;
    if (process.env.IIKO_API_LOGIN) {
      try {
        const orderData = {
          id: newOrder.id,
          order_number: newOrder.order_number,
          customer_name: customerName,
          phone: phone,
          email: email,
          address: address,
          delivery_type: deliveryType,
          payment_method: paymentMethod,
          notes: notes,
          final_total: total + (deliveryType === 'delivery' ? 200 : 0)
        };
        
        console.log('');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📤 ОТПРАВКА ЗАКАЗА В IIKO');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📋 Номер заказа:', newOrder.order_number);
        console.log('👤 Клиент:', customerName);
        console.log('📞 Телефон:', phone);
        console.log('📧 Email:', email);
        console.log('📍 Адрес:', address || 'Самовывоз');
        console.log('🚚 Тип доставки:', deliveryType === 'delivery' ? 'Доставка' : 'Самовывоз');
        console.log('💳 Оплата:', paymentMethod === 'cash' ? 'Наличные' : paymentMethod === 'card' ? 'Картой' : 'СБП');
        console.log('💰 Сумма:', orderData.final_total, '₽');
        console.log('📝 Комментарий:', notes || '—');
        console.log('───────────────────────────────────────────────────────────');
        console.log('🍽️  Позиции заказа:');
        orderItems.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.dish_name} x${item.quantity} — ${item.price * item.quantity}₽`);
        });
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');
        
        const iikoResult = await iikoService.createDeliveryOrder(orderData, orderItems);
        iikoOrderId = iikoResult?.orderInfo?.id;
        
        // Сохраняем iiko order id в нашу базу
        if (iikoOrderId) {
          await supabase
            .from('orders')
            .update({ iiko_order_id: iikoOrderId })
            .eq('id', newOrder.id);
          console.log('✅ ЗАКАЗ УСПЕШНО ОТПРАВЛЕН В IIKO!');
          console.log('   iiko Order ID:', iikoOrderId);
          console.log('');
        }
      } catch (iikoError) {
        // Логируем ошибку, но не блокируем создание заказа
        console.error('');
        console.error('⚠️ ОШИБКА ОТПРАВКИ В IIKO (заказ всё равно создан в нашей системе)');
        console.error('   Причина:', iikoError.message);
        console.error('');
      }
    }

    res.status(201).json({
      message: 'Заказ успешно создан',
      order: newOrder,
      iikoOrderId: iikoOrderId,
      bonuses: userId ? {
        used: actualBonusesToUse,
        earned: bonusesToEarn,
        newBalance: userBonusBalance - actualBonusesToUse + bonusesToEarn
      } : null
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Получение всех заказов (для админа)
const getAllOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          dish_id,
          dish_name,
          quantity,
          price
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get orders error:', error);
      return res.status(500).json({ error: 'Ошибка при получении заказов' });
    }

    res.json({ orders });

  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Получение заказов пользователя
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          dish_id,
          dish_name,
          quantity,
          price
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get user orders error:', error);
      return res.status(500).json({ error: 'Ошибка при получении заказов' });
    }

    res.json({ orders });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Обновление статуса заказа
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select('id, order_number, status, updated_at')
      .single();

    if (error) {
      console.error('Update order status error:', error);
      return res.status(500).json({ error: 'Ошибка при обновлении статуса заказа' });
    }

    res.json({
      message: 'Статус заказа обновлен',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus
};
