const supabase = require('../config/supabase');
const iikoService = require('../services/iikoService');

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
      notes
    } = req.body;

    const userId = req.user ? req.user.userId : null;

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
          delivery_fee: deliveryType === 'delivery' ? 200 : 0,
          final_total: total + (deliveryType === 'delivery' ? 200 : 0),
          status: 'pending',
          delivery_type: deliveryType,
          delivery_time: deliveryTime,
          payment_method: paymentMethod,
          notes: notes || '',
          user_id: userId,
          order_number: orderNumber,
          created_at: new Date().toISOString()
        }
      ])
      .select('id, order_number, customer_name, status, final_total, created_at')
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
        price: price
      };
    });

    // Логируем для отладки
    console.log('Order items to insert:', JSON.stringify(orderItems, null, 2));
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

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      // Удаляем заказ, если не удалось создать элементы
      await supabase.from('orders').delete().eq('id', newOrder.id);
      return res.status(500).json({ error: 'Ошибка при создании элементов заказа' });
    }

    // === Отправка заказа в iiko ===
    let iikoOrderId = null;
    if (process.env.IIKO_API_LOGIN) {
      try {
        console.log('📤 Отправка заказа в iiko...');
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
        
        const iikoResult = await iikoService.createDeliveryOrder(orderData, orderItems);
        iikoOrderId = iikoResult?.orderInfo?.id;
        
        // Сохраняем iiko order id в нашу базу
        if (iikoOrderId) {
          await supabase
            .from('orders')
            .update({ iiko_order_id: iikoOrderId })
            .eq('id', newOrder.id);
          console.log('✅ Заказ отправлен в iiko:', iikoOrderId);
        }
      } catch (iikoError) {
        // Логируем ошибку, но не блокируем создание заказа
        console.error('⚠️ Ошибка отправки в iiko (заказ всё равно создан):', iikoError.message);
      }
    }

    res.status(201).json({
      message: 'Заказ успешно создан',
      order: newOrder,
      iikoOrderId: iikoOrderId
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
