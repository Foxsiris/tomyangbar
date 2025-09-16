// Скрипт для очистки localStorage от старых данных
// Выполните этот код в консоли браузера на вашем сайте

console.log('🧹 Очистка localStorage...');

// Список ключей для удаления
const keysToRemove = [
  'tomyangbar_users',
  'tomyangbar_orders', 
  'tomyangbar_user',
  'cart',
  'cart_session_id'
];

// Удаляем старые данные
keysToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Удален ключ: ${key}`);
  } else {
    console.log(`ℹ️ Ключ не найден: ${key}`);
  }
});

// Показываем оставшиеся ключи
console.log('📋 Оставшиеся ключи в localStorage:');
Object.keys(localStorage).forEach(key => {
  console.log(`- ${key}`);
});

console.log('🎉 Очистка завершена! Теперь все данные будут храниться в Supabase.');
