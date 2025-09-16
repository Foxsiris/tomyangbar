// Тест Supabase в приложении
// Выполните этот код в консоли браузера

console.log('🔌 Тестируем Supabase в приложении...');

// 1. Проверяем, есть ли глобальные переменные
console.log('1. Проверяем глобальные переменные...');
console.log('window.location:', window.location.href);
console.log('window.origin:', window.origin);

// 2. Пытаемся найти Supabase клиент через модули
console.log('2. Ищем Supabase клиент...');

// Проверяем, есть ли импорты в коде
const scripts = document.querySelectorAll('script[type="module"]');
console.log('Найдено ES модулей:', scripts.length);

// 3. Проверяем, есть ли ошибки загрузки
console.log('3. Проверяем ошибки загрузки...');
const originalError = console.error;
let supabaseErrors = [];
console.error = function(...args) {
  const message = args.join(' ');
  if (message.includes('supabase') || message.includes('Supabase')) {
    supabaseErrors.push(message);
  }
  originalError.apply(console, args);
};

// 4. Пытаемся найти элементы, которые используют корзину
console.log('4. Ищем элементы корзины...');
const cartElements = document.querySelectorAll('*');
const cartRelatedElements = Array.from(cartElements).filter(el => {
  const text = el.textContent || '';
  const className = el.className || '';
  return text.includes('корзина') || 
         text.includes('cart') || 
         className.includes('cart') ||
         className.includes('Cart');
});
console.log('Найдено элементов, связанных с корзиной:', cartRelatedElements.length);

// 5. Проверяем, есть ли кнопки добавления в корзину
console.log('5. Ищем кнопки добавления...');
const buttons = document.querySelectorAll('button');
const addButtons = Array.from(buttons).filter(btn => {
  const text = btn.textContent.toLowerCase();
  return text.includes('корзину') || 
         text.includes('добавить') || 
         text.includes('купить');
});
console.log('Найдено кнопок добавления:', addButtons.length);

// 6. Пытаемся найти React компоненты
console.log('6. Ищем React компоненты...');
const reactElements = document.querySelectorAll('[data-reactroot], [data-react-helmet]');
console.log('Найдено React элементов:', reactElements.length);

// 7. Проверяем, есть ли ошибки в консоли
setTimeout(() => {
  console.log('7. Проверяем ошибки Supabase...');
  if (supabaseErrors.length > 0) {
    console.log('❌ Найдены ошибки Supabase:');
    supabaseErrors.forEach(error => console.log('  -', error));
  } else {
    console.log('✅ Ошибок Supabase не найдено');
  }
  
  // Восстанавливаем оригинальный console.error
  console.error = originalError;
}, 3000);

// 8. Пытаемся найти данные о товарах
console.log('8. Ищем данные о товарах...');
const dishElements = document.querySelectorAll('[class*="dish"], [class*="card"], [class*="item"]');
console.log('Найдено элементов товаров:', dishElements.length);

// 9. Проверяем, есть ли цены
console.log('9. Ищем цены...');
const priceElements = document.querySelectorAll('*');
const prices = Array.from(priceElements).filter(el => {
  const text = el.textContent || '';
  return text.includes('₽') || text.includes('руб');
});
console.log('Найдено элементов с ценами:', prices.length);

console.log('🎯 Тест завершен. Попробуйте добавить товар в корзину!');
