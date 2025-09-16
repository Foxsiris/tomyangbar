// Тест исправленной корзины
// Выполните этот код в консоли браузера

console.log('🔧 Тестируем исправленную корзину...');

// 1. Очищаем localStorage
console.log('1. Очищаем localStorage...');
localStorage.removeItem('cart_session_id');
console.log('✅ localStorage очищен');

// 2. Перезагружаем страницу
console.log('2. Перезагружаем страницу...');
window.location.reload();

// 3. После перезагрузки проверяем
setTimeout(() => {
  console.log('3. Проверяем после перезагрузки...');
  
  const sessionId = localStorage.getItem('cart_session_id');
  console.log('Новый Session ID:', sessionId);
  
  // 4. Ищем кнопки корзины
  const buttons = document.querySelectorAll('button');
  const cartButtons = Array.from(buttons).filter(btn => {
    const text = btn.textContent.toLowerCase();
    return text.includes('корзину') || text.includes('добавить');
  });
  
  console.log('Найдено кнопок корзины:', cartButtons.length);
  
  if (cartButtons.length > 0) {
    console.log('✅ Кнопки найдены!');
    console.log('Попробуйте добавить товар в корзину...');
    
    // Добавляем обработчик для отслеживания
    cartButtons[0].addEventListener('click', function() {
      console.log('🎯 КЛИК ПО КНОПКЕ КОРЗИНЫ!');
      
      // Проверяем через 2 секунды
      setTimeout(() => {
        const newSessionId = localStorage.getItem('cart_session_id');
        console.log('Session ID после клика:', newSessionId);
        
        if (newSessionId === sessionId) {
          console.log('✅ Session ID не изменился - корзина переиспользуется');
        } else {
          console.log('❌ Session ID изменился - создается новая корзина');
        }
      }, 2000);
    });
  } else {
    console.log('❌ Кнопки корзины не найдены');
  }
}, 1000);

console.log('🎯 Тест запущен. Перезагрузите страницу и попробуйте добавить товар в корзину.');
