// Тест открытия корзины
// Выполните этот код в консоли браузера

console.log('🛒 Тестируем открытие корзины...');

// 1. Проверяем, есть ли кнопка корзины
console.log('1. Ищем кнопку корзины...');
const cartButtons = document.querySelectorAll('button');
const floatingCartButton = Array.from(cartButtons).find(btn => {
  const text = btn.textContent || '';
  const className = btn.className || '';
  return className.includes('fixed') && className.includes('bottom') && className.includes('right');
});

if (floatingCartButton) {
  console.log('✅ Кнопка плавающей корзины найдена');
  console.log('Кнопка:', floatingCartButton);
  
  // 2. Проверяем, есть ли обработчик клика
  console.log('2. Проверяем обработчик клика...');
  
  // Добавляем тестовый обработчик
  floatingCartButton.addEventListener('click', function(e) {
    console.log('🎯 КЛИК ПО КНОПКЕ КОРЗИНЫ!');
    console.log('Event:', e);
    console.log('Button:', this);
    
    // Проверяем через 1 секунду, открылась ли корзина
    setTimeout(() => {
      const cartPanel = document.querySelector('[class*="fixed"][class*="right-0"][class*="top-0"]');
      if (cartPanel) {
        console.log('✅ Корзина открылась!');
        console.log('Панель корзины:', cartPanel);
      } else {
        console.log('❌ Корзина не открылась');
      }
    }, 1000);
  });
  
  console.log('Попробуйте кликнуть по кнопке корзины...');
} else {
  console.log('❌ Кнопка плавающей корзины не найдена');
}

// 3. Проверяем, есть ли элементы корзины
console.log('3. Ищем элементы корзины...');
const cartElements = document.querySelectorAll('[class*="cart"], [class*="Cart"]');
console.log('Найдено элементов корзины:', cartElements.length);

// 4. Проверяем, есть ли панель корзины
console.log('4. Ищем панель корзины...');
const sidePanel = document.querySelector('[class*="fixed"][class*="right-0"][class*="top-0"]');
if (sidePanel) {
  console.log('✅ Панель корзины найдена');
  console.log('Панель:', sidePanel);
} else {
  console.log('❌ Панель корзины не найдена');
}

// 5. Проверяем, есть ли товары в корзине
console.log('5. Проверяем товары в корзине...');
const cartItems = document.querySelectorAll('[class*="cart"][class*="item"]');
console.log('Найдено товаров в корзине:', cartItems.length);

// 6. Проверяем счетчик корзины
console.log('6. Проверяем счетчик корзины...');
const cartCounters = document.querySelectorAll('[class*="badge"], [class*="count"]');
console.log('Найдено счетчиков:', cartCounters.length);

console.log('🎯 Тест завершен! Попробуйте кликнуть по кнопке корзины.');
