// Простой тест корзины для браузера
// Выполните этот код в консоли браузера на странице приложения

console.log('🧪 Простой тест корзины...');

// 1. Проверяем localStorage
console.log('1. Проверяем localStorage...');
const sessionId = localStorage.getItem('cart_session_id');
console.log('Session ID:', sessionId);

// 2. Проверяем, есть ли кнопки "В корзину"
console.log('2. Ищем кнопки "В корзину"...');
const addToCartButtons = document.querySelectorAll('button');
const cartButtons = Array.from(addToCartButtons).filter(btn => 
  btn.textContent.includes('В корзину') || btn.textContent.includes('корзину')
);
console.log('Найдено кнопок корзины:', cartButtons.length);

// 3. Проверяем, есть ли товары на странице
console.log('3. Ищем товары на странице...');
const dishCards = document.querySelectorAll('[class*="card"]');
console.log('Найдено карточек товаров:', dishCards.length);

// 4. Проверяем, есть ли корзина в интерфейсе
console.log('4. Ищем корзину в интерфейсе...');
const cartElements = document.querySelectorAll('[class*="cart"]');
console.log('Найдено элементов корзины:', cartElements.length);

// 5. Проверяем счетчик корзины
console.log('5. Ищем счетчик корзины...');
const cartCounters = document.querySelectorAll('[class*="count"], [class*="badge"]');
console.log('Найдено счетчиков:', cartCounters.length);

// 6. Пытаемся найти React DevTools
console.log('6. Проверяем React DevTools...');
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  console.log('✅ React DevTools доступны');
} else {
  console.log('❌ React DevTools не найдены');
}

// 7. Проверяем, есть ли ошибки в консоли
console.log('7. Проверяем ошибки...');
const originalError = console.error;
let errorCount = 0;
console.error = function(...args) {
  errorCount++;
  originalError.apply(console, args);
};

// 8. Пытаемся кликнуть по кнопке "В корзину"
if (cartButtons.length > 0) {
  console.log('8. Тестируем клик по кнопке корзины...');
  const firstButton = cartButtons[0];
  console.log('Кнопка:', firstButton);
  
  // Добавляем обработчик для отслеживания кликов
  firstButton.addEventListener('click', function() {
    console.log('✅ Клик по кнопке корзины зарегистрирован!');
  });
  
  console.log('Попробуйте кликнуть по кнопке "В корзину" и посмотрите, что произойдет...');
} else {
  console.log('❌ Кнопки корзины не найдены');
}

// 9. Проверяем, есть ли уведомления
setTimeout(() => {
  console.log('9. Проверяем уведомления...');
  const notifications = document.querySelectorAll('[class*="notification"], [class*="toast"], [class*="alert"]');
  console.log('Найдено уведомлений:', notifications.length);
  
  if (errorCount > 0) {
    console.log(`⚠️ Обнаружено ${errorCount} ошибок в консоли`);
  } else {
    console.log('✅ Ошибок в консоли не обнаружено');
  }
}, 2000);

console.log('🎯 Тест завершен. Попробуйте добавить товар в корзину и посмотрите на результат!');
