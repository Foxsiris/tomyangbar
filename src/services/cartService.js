import { supabase } from '../config/supabase.js';

// Сервис для работы с корзиной
export class CartService {
  // Получение или создание корзины
  static async getOrCreateCart(userId = null, sessionId = null) {
    try {
      let query = supabase.from('carts').select('*');
      
      if (userId) {
        query = query.eq('user_id', userId);
      } else if (sessionId) {
        query = query.eq('session_id', sessionId).is('user_id', null);
      }

      const { data: existingCarts, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Если есть существующая корзина, возвращаем первую
      if (existingCarts && existingCarts.length > 0) {
        return existingCarts[0];
      }

      // Создаем новую корзину
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert([{
          user_id: userId,
          session_id: sessionId
        }])
        .select()
        .single();

      if (createError) throw createError;
      return newCart;
    } catch (error) {
      console.error('Error getting or creating cart:', error);
      throw error;
    }
  }

  // Получение элементов корзины
  static async getCartItems(cartId) {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting cart items:', error);
      throw error;
    }
  }

  // Добавление товара в корзину
  static async addToCart(cartId, dish, quantity = 1) {
    try {
      // Проверяем, есть ли уже такой товар в корзине
      const { data: existingItem, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId)
        .eq('dish_id', dish.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingItem) {
        // Обновляем количество существующего товара
        const { data, error } = await supabase
          .from('cart_items')
          .update({ 
            quantity: existingItem.quantity + quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Добавляем новый товар
        const { data, error } = await supabase
          .from('cart_items')
          .insert([{
            cart_id: cartId,
            dish_id: dish.id,
            dish_name: dish.name,
            quantity: quantity,
            price: dish.price
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  // Обновление количества товара в корзине
  static async updateCartItemQuantity(cartItemId, quantity) {
    try {
      if (quantity <= 0) {
        // Удаляем товар из корзины
        return await this.removeFromCart(cartItemId);
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ 
          quantity: quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartItemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      throw error;
    }
  }

  // Удаление товара из корзины
  static async removeFromCart(cartItemId) {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  // Очистка корзины
  static async clearCart(cartId) {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  // Получение полной корзины с товарами
  static async getFullCart(userId = null, sessionId = null) {
    try {
      const cart = await this.getOrCreateCart(userId, sessionId);
      const items = await this.getCartItems(cart.id);
      
      return {
        ...cart,
        items: items
      };
    } catch (error) {
      console.error('Error getting full cart:', error);
      throw error;
    }
  }

  // Подсчет общего количества товаров в корзине
  static async getCartTotalItems(cartId) {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('cart_id', cartId);

      if (error) throw error;
      
      return data.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error('Error getting cart total items:', error);
      throw error;
    }
  }

  // Подсчет общей стоимости корзины
  static async getCartTotalPrice(cartId) {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('quantity, price')
        .eq('cart_id', cartId);

      if (error) throw error;
      
      return data.reduce((total, item) => total + (item.quantity * item.price), 0);
    } catch (error) {
      console.error('Error getting cart total price:', error);
      throw error;
    }
  }

  // Перенос корзины от сессии к пользователю (при авторизации)
  static async transferCartToUser(sessionId, userId) {
    try {
      // Находим корзину сессии
      const { data: sessionCart, error: fetchError } = await supabase
        .from('carts')
        .select('*')
        .eq('session_id', sessionId)
        .is('user_id', null)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!sessionCart) {
        return null; // Нет корзины сессии
      }

      // Проверяем, есть ли уже корзина у пользователя
      const { data: userCart, error: userCartError } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (userCartError && userCartError.code !== 'PGRST116') {
        throw userCartError;
      }

      if (userCart) {
        // Объединяем корзины
        const sessionItems = await this.getCartItems(sessionCart.id);
        
        for (const item of sessionItems) {
          await this.addToCart(userCart.id, {
            id: item.dish_id,
            name: item.dish_name,
            price: item.price
          }, item.quantity);
        }

        // Удаляем корзину сессии
        await this.clearCart(sessionCart.id);
        await supabase.from('carts').delete().eq('id', sessionCart.id);
        
        return userCart;
      } else {
        // Переносим корзину сессии пользователю
        const { data, error } = await supabase
          .from('carts')
          .update({ 
            user_id: userId,
            session_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionCart.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error transferring cart to user:', error);
      throw error;
    }
  }

  // Генерация уникального ID сессии
  static generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }
}
