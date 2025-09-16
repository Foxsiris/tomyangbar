import { supabase } from '../config/supabase.js';

// Сервис для работы с пользователями
export class UserService {
  // Регистрация нового пользователя
  static async register(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          password_hash: userData.password // В реальном приложении нужно хешировать
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  // Аутентификация пользователя
  static async authenticate(email, password) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password)
        .single();

      if (error) throw error;
      
      // Обновляем время последнего входа
      await this.updateLastLogin(data.id);
      
      return data;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  // Аутентификация по email или телефону
  static async authenticateByEmailOrPhone(identifier, password) {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .eq('password_hash', password);

      if (identifier.includes('@')) {
        query = query.eq('email', identifier);
      } else {
        query = query.eq('phone', identifier);
      }

      const { data, error } = await query.single();

      if (error) throw error;
      
      // Обновляем время последнего входа
      await this.updateLastLogin(data.id);
      
      return data;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  // Поиск пользователя по email
  static async findByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Поиск пользователя по телефону
  static async findByPhone(phone) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error finding user by phone:', error);
      throw error;
    }
  }

  // Поиск пользователя по ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Обновление данных пользователя
  static async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Обновление времени последнего входа
  static async updateLastLogin(id) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  // Получение истории заказов пользователя
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

  // Получение статистики пользователя
  static async getUserStats(userId) {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.final_total), 0);
      const completedOrders = orders.filter(order => order.status === 'completed').length;
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      // Получаем популярные блюда
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('dish_name, quantity')
        .in('order_id', orders.map(o => o.id));

      if (itemsError) throw itemsError;

      const dishCounts = {};
      orderItems.forEach(item => {
        dishCounts[item.dish_name] = (dishCounts[item.dish_name] || 0) + item.quantity;
      });

      const favoriteDishes = Object.entries(dishCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      return {
        totalOrders,
        totalSpent,
        completedOrders,
        averageOrderValue,
        favoriteDishes,
        memberSince: orders[0]?.created_at || null,
        lastOrder: orders[0]?.created_at || null
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  // Проверка существования пользователя
  static async userExists(email) {
    try {
      const user = await this.findByEmail(email);
      return !!user;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }

  // Проверка существования пользователя по телефону
  static async userExistsByPhone(phone) {
    try {
      const user = await this.findByPhone(phone);
      return !!user;
    } catch (error) {
      console.error('Error checking user existence by phone:', error);
      return false;
    }
  }

  // Авторизация админа
  static async authenticateAdmin(email, password) {
    try {
      console.log('🔐 Авторизация админа:', email);
      
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('❌ Ошибка поиска админа:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Админ не найден');
      }

      // Простая проверка пароля (в реальном проекте используйте bcrypt)
      if (password === 'admin123') {
        console.log('✅ Админ авторизован:', data);
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          role: 'admin',
          isAdmin: true
        };
      } else {
        throw new Error('Неверный пароль');
      }
    } catch (error) {
      console.error('❌ Ошибка авторизации админа:', error);
      throw error;
    }
  }
}
