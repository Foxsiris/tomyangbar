import { supabase } from '../config/supabase.js';

// Сервис для работы с заказами
export class OrderService {
  // Создание нового заказа
  static async createOrder(orderData, userId = null) {
    try {
      // Создаем заказ
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: userId,
          customer_name: orderData.customerName,
          phone: orderData.phone,
          email: orderData.email,
          address: orderData.address,
          total: orderData.total,
          delivery_fee: orderData.deliveryType === 'delivery' ? 200 : 0,
          final_total: orderData.total + (orderData.deliveryType === 'delivery' ? 200 : 0),
          status: 'pending',
          delivery_type: orderData.deliveryType,
          delivery_time: orderData.deliveryTime,
          payment_method: orderData.paymentMethod,
          notes: orderData.notes || ''
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Создаем элементы заказа
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        dish_id: item.dish_id, // Используем dish_id из cart_items
        dish_name: item.dish_name || item.name, // Используем dish_name из cart_items
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Получаем полный заказ с элементами
      const { data: fullOrder, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', order.id)
        .single();

      if (fetchError) throw fetchError;

      // Отправляем уведомление в Telegram (асинхронно)
      try {
        const { sendNewOrderNotification } = await import('../utils/telegramNotifications');
        sendNewOrderNotification(fullOrder).catch(error => {
          console.error('Failed to send Telegram notification:', error);
        });
      } catch (error) {
        console.error('Error importing telegram notifications:', error);
      }

      return fullOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Получение всех заказов
  static async getAllOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting all orders:', error);
      throw error;
    }
  }

  // Получение заказов по статусу
  static async getOrdersByStatus(status) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting orders by status:', error);
      throw error;
    }
  }

  // Получение заказов пользователя
  static async getUserOrders(userId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw error;
    }
  }

  // Обновление статуса заказа
  static async updateOrderStatus(orderId, newStatus) {
    try {
      const updateData = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select(`
          *,
          order_items (*)
        `)
        .single();

      if (error) throw error;

      // Отправляем уведомление об обновлении статуса в Telegram
      try {
        const { sendStatusUpdateNotification } = await import('../utils/telegramNotifications');
        sendStatusUpdateNotification(data).catch(error => {
          console.error('Failed to send status update notification:', error);
        });
      } catch (error) {
        console.error('Error importing telegram notifications:', error);
      }

      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Получение статистики заказов
  static async getOrderStats() {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*');

      if (error) throw error;

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.final_total), 0);
      const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
      const activeOrders = orders.filter(order => 
        ['pending', 'preparing', 'delivering'].includes(order.status)
      ).length;
      const completedOrders = orders.filter(order => order.status === 'completed').length;

      return {
        totalOrders,
        totalRevenue,
        avgOrderValue,
        activeOrders,
        completedOrders,
        customerRating: 4.8, // Моковые данные
        deliveryTime: 45, // Моковые данные
        repeatCustomers: 68 // Моковые данные
      };
    } catch (error) {
      console.error('Error getting order stats:', error);
      throw error;
    }
  }

  // Получение популярных блюд
  static async getPopularDishes() {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('dish_name, quantity, price');

      if (error) throw error;

      const dishCounts = {};
      data.forEach(item => {
        if (dishCounts[item.dish_name]) {
          dishCounts[item.dish_name].count += item.quantity;
          dishCounts[item.dish_name].revenue += item.price * item.quantity;
        } else {
          dishCounts[item.dish_name] = {
            count: item.quantity,
            revenue: item.price * item.quantity
          };
        }
      });

      return Object.entries(dishCounts)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    } catch (error) {
      console.error('Error getting popular dishes:', error);
      throw error;
    }
  }

  // Получение почасовой статистики
  static async getHourlyStats() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('created_at, final_total');

      if (error) throw error;

      const hourlyData = {};
      data.forEach(order => {
        const hour = new Date(order.created_at).getHours();
        if (hourlyData[hour]) {
          hourlyData[hour].orders += 1;
          hourlyData[hour].revenue += parseFloat(order.final_total);
        } else {
          hourlyData[hour] = { orders: 1, revenue: parseFloat(order.final_total) };
        }
      });

      return Array.from({ length: 24 }, (_, hour) => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        orders: hourlyData[hour]?.orders || 0,
        revenue: hourlyData[hour]?.revenue || 0
      }));
    } catch (error) {
      console.error('Error getting hourly stats:', error);
      throw error;
    }
  }

  // Получение недельной статистики
  static async getWeeklyStats() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('created_at, final_total');

      if (error) throw error;

      const weeklyData = {};
      const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
      
      data.forEach(order => {
        const day = days[new Date(order.created_at).getDay()];
        if (weeklyData[day]) {
          weeklyData[day].orders += 1;
          weeklyData[day].revenue += parseFloat(order.final_total);
        } else {
          weeklyData[day] = { orders: 1, revenue: parseFloat(order.final_total) };
        }
      });

      return days.map(day => ({
        day,
        orders: weeklyData[day]?.orders || 0,
        revenue: weeklyData[day]?.revenue || 0
      }));
    } catch (error) {
      console.error('Error getting weekly stats:', error);
      throw error;
    }
  }

  // Получение заказов по диапазону дат
  static async getOrdersByDateRange(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting orders by date range:', error);
      throw error;
    }
  }
}
