// Тестовый скрипт для отладки корзины
// Запустите в консоли браузера на странице приложения

import { supabase } from './src/config/supabase.js';
import { CartService } from './src/services/cartService.js';

// Функция для тестирования корзины
async function testCart() {
  console.log('🧪 Начинаем тестирование корзины...');
  
  try {
    // 1. Проверяем подключение к Supabase
    console.log('1. Проверяем подключение к Supabase...');
    const { data, error } = await supabase.from('carts').select('count').limit(1);
    if (error) {
      console.error('❌ Ошибка подключения к Supabase:', error);
      return;
    }
    console.log('✅ Подключение к Supabase работает');
    
    // 2. Генерируем sessionId для тестирования
    const sessionId = CartService.generateSessionId();
    console.log('2. SessionId для тестирования:', sessionId);
    
    // 3. Создаем корзину
    console.log('3. Создаем корзину...');
    const cart = await CartService.getOrCreateCart(null, sessionId);
    console.log('✅ Корзина создана:', cart);
    
    // 4. Получаем тестовое блюдо
    console.log('4. Получаем тестовое блюдо...');
    const { data: dishes, error: dishesError } = await supabase
      .from('dishes')
      .select('*')
      .limit(1);
    
    if (dishesError || !dishes || dishes.length === 0) {
      console.error('❌ Не удалось получить блюда:', dishesError);
      return;
    }
    
    const testDish = dishes[0];
    console.log('✅ Тестовое блюдо:', testDish);
    
    // 5. Добавляем блюдо в корзину
    console.log('5. Добавляем блюдо в корзину...');
    const cartItem = await CartService.addToCart(cart.id, testDish, 1);
    console.log('✅ Блюдо добавлено в корзину:', cartItem);
    
    // 6. Получаем полную корзину
    console.log('6. Получаем полную корзину...');
    const fullCart = await CartService.getFullCart(null, sessionId);
    console.log('✅ Полная корзина:', fullCart);
    
    // 7. Проверяем общее количество и стоимость
    const totalItems = await CartService.getCartTotalItems(cart.id);
    const totalPrice = await CartService.getCartTotalPrice(cart.id);
    console.log('✅ Общее количество товаров:', totalItems);
    console.log('✅ Общая стоимость:', totalPrice);
    
    console.log('🎉 Тестирование корзины завершено успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании корзины:', error);
  }
}

// Запускаем тест
testCart();
