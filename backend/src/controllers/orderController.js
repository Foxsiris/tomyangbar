const supabase = require('../config/supabase');

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

    // Генерируем номер заказа - получаем следующий порядковый номер
    const { data: lastOrder } = await supabase
      .from('orders')
      .select('order_number')
      .order('order_number', { ascending: false })
      .limit(1)
      .single();
    
    const orderNumber = lastOrder?.order_number ? lastOrder.order_number + 1 : 1;

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
      return res.status(500).json({ error: 'Ошибка при создании заказа' });
    }

    // Создаем элементы заказа
    const orderItems = items.map(item => ({
      order_id: newOrder.id,
      dish_id: item.dish_id,
      dish_name: item.dish_name || item.name,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      // Удаляем заказ, если не удалось создать элементы
      await supabase.from('orders').delete().eq('id', newOrder.id);
      return res.status(500).json({ error: 'Ошибка при создании элементов заказа' });
    }

    res.status(201).json({
      message: 'Заказ успешно создан',
      order: newOrder
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
