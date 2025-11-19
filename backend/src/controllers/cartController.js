const supabase = require('../config/supabase');

// Получение или создание корзины
const getOrCreateCart = async (req, res) => {
  try {
    // Определяем тип пользователя
    const isAdmin = req.user && req.user.role === 'admin';
    const userId = (req.user && !isAdmin) ? req.user.userId : null;
    const { sessionId } = req.body;

    // Для админов используем только sessionId
    if (isAdmin) {
      const { data: existingCarts, error: fetchError } = await supabase
        .from('carts')
        .select('*')
        .eq('session_id', sessionId)
        .is('user_id', null);

      if (fetchError) {
        console.error('Get cart error:', fetchError);
        return res.status(500).json({ error: 'Ошибка при получении корзины' });
      }

      let cart;
      if (existingCarts && existingCarts.length > 0) {
        cart = existingCarts[0];
      } else {
        // Создаем новую корзину только с sessionId
        const cartData = {
          user_id: null,
          session_id: sessionId,
          created_at: new Date().toISOString()
        };

        const { data: newCart, error: createError } = await supabase
          .from('carts')
          .insert([cartData])
          .select()
          .single();

        if (createError) {
          console.error('Create cart error:', createError);
          return res.status(500).json({ error: 'Ошибка при создании корзины' });
        }

        cart = newCart;
      }

      // Получаем элементы корзины
      const { data: cartItems, error: itemsError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cart.id);

      if (itemsError) {
        console.error('Get cart items error:', itemsError);
        return res.status(500).json({ error: 'Ошибка при получении элементов корзины' });
      }

      return res.json({
        cart: {
          ...cart,
          items: cartItems || []
        }
      });
    }

    let query = supabase.from('carts').select('*');
    
    if (userId) {
      query = query.eq('user_id', userId);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId).is('user_id', null);
    }

    const { data: existingCarts, error: fetchError } = await query;

    if (fetchError) {
      console.error('Get cart error:', fetchError);
      return res.status(500).json({ error: 'Ошибка при получении корзины' });
    }

    let cart;
    if (existingCarts && existingCarts.length > 0) {
      cart = existingCarts[0];
    } else {
      // Создаем новую корзину
      const cartData = {
        user_id: userId,
        session_id: sessionId,
        created_at: new Date().toISOString()
      };

      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert([cartData])
        .select()
        .single();

      if (createError) {
        console.error('Create cart error:', createError);
        return res.status(500).json({ error: 'Ошибка при создании корзины' });
      }

      cart = newCart;
    }

    // Получаем элементы корзины
    const { data: cartItems, error: itemsError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart.id);

    if (itemsError) {
      console.error('Get cart items error:', itemsError);
      return res.status(500).json({ error: 'Ошибка при получении элементов корзины' });
    }

    res.json({
      cart: {
        ...cart,
        items: cartItems || []
      }
    });

  } catch (error) {
    console.error('Get or create cart error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Добавление товара в корзину
const addToCart = async (req, res) => {
  try {
    const { cartId, dishId, dishName, price, quantity = 1, imageUrl } = req.body;

    // Проверяем, есть ли уже такой товар в корзине
    const { data: existingItem, error: checkError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .eq('dish_id', dishId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Check cart item error:', checkError);
      return res.status(500).json({ error: 'Ошибка при проверке корзины' });
    }

    if (existingItem) {
      // Обновляем количество
      const { data: updatedItem, error: updateError } = await supabase
        .from('cart_items')
        .update({
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (updateError) {
        console.error('Update cart item error:', updateError);
        return res.status(500).json({ error: 'Ошибка при обновлении корзины' });
      }

      res.json({ item: updatedItem });
    } else {
      // Добавляем новый товар
      const { data: newItem, error: insertError } = await supabase
        .from('cart_items')
        .insert([{
          cart_id: cartId,
          dish_id: dishId,
          dish_name: dishName,
          price: price,
          quantity: quantity,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Insert cart item error:', insertError);
        return res.status(500).json({ error: 'Ошибка при добавлении в корзину' });
      }

      res.json({ item: newItem });
    }

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Обновление количества товара в корзине
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      // Удаляем товар из корзины
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (deleteError) {
        console.error('Delete cart item error:', deleteError);
        return res.status(500).json({ error: 'Ошибка при удалении из корзины' });
      }

      res.json({ message: 'Товар удален из корзины' });
    } else {
      // Обновляем количество
      const { data: updatedItem, error: updateError } = await supabase
        .from('cart_items')
        .update({
          quantity: quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select()
        .single();

      if (updateError) {
        console.error('Update cart item error:', updateError);
        return res.status(500).json({ error: 'Ошибка при обновлении корзины' });
      }

      res.json({ item: updatedItem });
    }

  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Удаление товара из корзины
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Remove from cart error:', error);
      return res.status(500).json({ error: 'Ошибка при удалении из корзины' });
    }

    res.json({ message: 'Товар удален из корзины' });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Очистка корзины
const clearCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);

    if (error) {
      console.error('Clear cart error:', error);
      return res.status(500).json({ error: 'Ошибка при очистке корзины' });
    }

    res.json({ message: 'Корзина очищена' });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

module.exports = {
  getOrCreateCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
