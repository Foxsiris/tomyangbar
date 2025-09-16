// Тест подключения к Supabase
// Выполните этот код в консоли браузера

console.log('🔌 Тестируем подключение к Supabase...');

// Проверяем переменные окружения
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Есть' : 'Нет');

// Создаем клиент Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fguwtuaxtjrojgjnxchv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZndXd0dWF4dGpyb2pnam54Y2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDg0ODUsImV4cCI6MjA3MzYyNDQ4NX0.-NyA5IJkBuYG-qMABFNQ5KFw38q8RHdg182Eswwddlw';

const supabase = createClient(supabaseUrl, supabaseKey);

// Тестируем подключение
console.log('Тестируем подключение...');

// 1. Проверяем таблицы
supabase.from('carts').select('count').limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Ошибка подключения к таблице carts:', error);
    } else {
      console.log('✅ Подключение к таблице carts работает');
    }
  });

// 2. Проверяем таблицу dishes
supabase.from('dishes').select('count').limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Ошибка подключения к таблице dishes:', error);
    } else {
      console.log('✅ Подключение к таблице dishes работает');
    }
  });

// 3. Проверяем RLS статус
supabase.from('carts').select('*').limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Ошибка при попытке получить данные из carts:', error);
      console.log('Возможно, проблема с RLS политиками');
    } else {
      console.log('✅ Данные из carts получены успешно:', data);
    }
  });

// 4. Тестируем вставку
const testSessionId = 'test_' + Date.now();
supabase.from('carts').insert([{ session_id: testSessionId }]).select()
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Ошибка при вставке в carts:', error);
    } else {
      console.log('✅ Вставка в carts работает:', data);
      
      // Удаляем тестовую запись
      if (data && data[0]) {
        supabase.from('carts').delete().eq('id', data[0].id)
          .then(() => console.log('✅ Тестовая запись удалена'));
      }
    }
  });
