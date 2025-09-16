// Быстрый тест корзины
// Выполните этот код в консоли браузера

console.log('⚡ Быстрый тест корзины...');

// 1. Проверяем, что страница загружена
console.log('1. Проверяем загрузку страницы...');
console.log('URL:', window.location.href);
console.log('Title:', document.title);

// 2. Ищем кнопки "В корзину"
console.log('2. Ищем кнопки "В корзину"...');
const buttons = document.querySelectorAll('button');
const cartButtons = Array.from(buttons).filter(btn => {
  const text = btn.textContent.toLowerCase();
  return text.includes('корзину') || text.includes('добавить');
});
console.log('Найдено кнопок:', cartButtons.length);

if (cartButtons.length > 0) {
  console.log('✅ Кнопки найдены!');
  cartButtons.forEach((btn, index) => {
    console.log(`Кнопка ${index + 1}:`, btn.textContent);
  });
} else {
  console.log('❌ Кнопки не найдены');
}

// 3. Ищем товары
console.log('3. Ищем товары...');
const cards = document.querySelectorAll('[class*="card"]');
console.log('Найдено карточек:', cards.length);

// 4. Проверяем localStorage
console.log('4. Проверяем localStorage...');
const sessionId = localStorage.getItem('cart_session_id');
console.log('Session ID:', sessionId);

// 5. Пытаемся кликнуть по первой кнопке
if (cartButtons.length > 0) {
  console.log('5. Тестируем клик...');
  const firstButton = cartButtons[0];
  
  // Добавляем обработчик
  firstButton.addEventListener('click', function(e) {
    console.log('🎯 КЛИК ПО КНОПКЕ КОРЗИНЫ!');
    console.log('Event:', e);
    console.log('Button:', this);
  });
  
  console.log('Попробуйте кликнуть по кнопке "В корзину" и посмотрите, что произойдет...');
} else {
  console.log('❌ Нет кнопок для тестирования');
}

// 6. Проверяем, есть ли ошибки
console.log('6. Проверяем ошибки...');
const originalError = console.error;
let errorCount = 0;
console.error = function(...args) {
  errorCount++;
  originalError.apply(console, args);
};

setTimeout(() => {
  if (errorCount > 0) {
    console.log(`⚠️ Найдено ${errorCount} ошибок`);
  } else {
    console.log('✅ Ошибок не найдено');
  }
  console.error = originalError;
}, 2000);

console.log('🎯 Тест завершен! Попробуйте добавить товар в корзину.');
