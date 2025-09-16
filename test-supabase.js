// Тест подключения к Supabase
// Выполните этот код в консоли браузера

import { supabase } from './src/config/supabase.js';

console.log('🔍 Тестируем подключение к Supabase...');

// Тест 1: Проверка подключения
console.log('Supabase URL:', supabase.supabaseUrl);
console.log('Supabase Key:', supabase.supabaseKey ? 'Есть' : 'Нет');

// Тест 2: Проверка таблиц
async function testTables() {
  try {
    console.log('📋 Проверяем таблицы...');
    
    // Проверяем категории
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    if (catError) {
      console.error('❌ Ошибка категорий:', catError);
    } else {
      console.log('✅ Категории:', categories);
    }
    
    // Проверяем блюда
    const { data: dishes, error: dishError } = await supabase
      .from('dishes')
      .select('*')
      .limit(5);
    
    if (dishError) {
      console.error('❌ Ошибка блюд:', dishError);
    } else {
      console.log('✅ Блюда:', dishes);
    }
    
  } catch (error) {
    console.error('❌ Общая ошибка:', error);
  }
}

testTables();
