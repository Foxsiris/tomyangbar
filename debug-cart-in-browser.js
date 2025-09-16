// Скрипт для отладки корзины в браузере
// Выполните этот код в консоли браузера на странице приложения

console.log('🔍 Начинаем отладку корзины...');

// 1. Проверяем, что Supabase подключен
console.log('1. Проверяем Supabase...');
if (typeof window.supabase !== 'undefined') {
  console.log('✅ Supabase доступен');
} else {
  console.log('❌ Supabase не найден');
}

// 2. Проверяем localStorage
console.log('2. Проверяем localStorage...');
const sessionId = localStorage.getItem('cart_session_id');
console.log('Session ID:', sessionId);

// 3. Проверяем контекст корзины
console.log('3. Проверяем контекст корзины...');
if (typeof window.React !== 'undefined') {
  console.log('✅ React доступен');
} else {
  console.log('❌ React не найден');
}

// 4. Тестируем прямое обращение к Supabase
console.log('4. Тестируем прямое обращение к Supabase...');

// Импортируем Supabase (если доступен)
if (typeof window.supabase !== 'undefined') {
  const { supabase } = window.supabase;
  
  // Тестируем подключение
  supabase.from('carts').select('count').limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Ошибка подключения к Supabase:', error);
      } else {
        console.log('✅ Подключение к Supabase работает');
        
        // Тестируем создание корзины
        const testSessionId = 'test_' + Date.now();
        console.log('5. Тестируем создание корзины...');
        
        supabase.from('carts').insert([{
          session_id: testSessionId
        }]).select().single()
          .then(({ data: cart, error: cartError }) => {
            if (cartError) {
              console.error('❌ Ошибка создания корзины:', cartError);
            } else {
              console.log('✅ Корзина создана:', cart);
              
              // Тестируем добавление товара
              console.log('6. Тестируем добавление товара...');
              
              // Сначала получаем блюдо
              supabase.from('dishes').select('*').limit(1).single()
                .then(({ data: dish, error: dishError }) => {
                  if (dishError) {
                    console.error('❌ Ошибка получения блюда:', dishError);
                  } else {
                    console.log('✅ Блюдо получено:', dish);
                    
                    // Добавляем в корзину
                    supabase.from('cart_items').insert([{
                      cart_id: cart.id,
                      dish_id: dish.id,
                      dish_name: dish.name,
                      quantity: 1,
                      price: dish.price
                    }]).select().single()
                      .then(({ data: item, error: itemError }) => {
                        if (itemError) {
                          console.error('❌ Ошибка добавления товара:', itemError);
                        } else {
                          console.log('✅ Товар добавлен в корзину:', item);
                          console.log('🎉 Тест корзины прошел успешно!');
                        }
                      });
                  }
                });
            }
          });
      }
    });
} else {
  console.log('❌ Supabase не доступен в window объекте');
}

// 5. Проверяем ошибки в консоли
console.log('5. Проверьте консоль на наличие ошибок...');
