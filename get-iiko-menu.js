// Скрипт для получения меню из iiko API и сохранения UUID, названий и ID в txt файл
const http = require('http');
const fs = require('fs');

// URL для запроса меню
const url = 'http://localhost:3001/api/iiko/menu';

console.log('Запрос к iiko API...');

// Делаем запрос
http.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('Данные получены, обработка...');
      
      // Извлекаем все блюда из меню
      const dishes = [];
      
      // Рекурсивная функция для обработки групп
      function processGroup(group) {
        // Обрабатываем продукты в группе
        if (group.items && Array.isArray(group.items)) {
          group.items.forEach(item => {
            if (item.type === 'Product' || item.type === 'Dish') {
              dishes.push({
                uuid: item.id || '',
                name: item.name || '',
                id: item.code || ''
              });
            }
          });
        }
        
        // Рекурсивно обрабатываем подгруппы
        if (group.groups && Array.isArray(group.groups)) {
          group.groups.forEach(subGroup => {
            processGroup(subGroup);
          });
        }
      }
      
      // Проходим по всем группам
      if (jsonData.groups && Array.isArray(jsonData.groups)) {
        jsonData.groups.forEach(group => {
          processGroup(group);
        });
      }
      
      // Также проверяем items на верхнем уровне
      if (jsonData.items && Array.isArray(jsonData.items)) {
        jsonData.items.forEach(item => {
          if (item.type === 'Product' || item.type === 'Dish') {
            dishes.push({
              uuid: item.id || '',
              name: item.name || '',
              id: item.code || ''
            });
          }
        });
      }
    
    console.log(`Найдено блюд: ${dishes.length}`);
    
    // Формируем содержимое файла
    let content = 'UUID\tНазвание блюда\tID\n';
    content += '='.repeat(80) + '\n';
    
    dishes.forEach(dish => {
      content += `${dish.uuid}\t${dish.name}\t${dish.id}\n`;
    });
    
      // Сохраняем в файл
      const filename = 'iiko-menu-dishes.txt';
      fs.writeFileSync(filename, content, 'utf8');
      
      console.log(`✅ Данные сохранены в файл: ${filename}`);
      console.log(`Всего блюд: ${dishes.length}`);
      
      // Выводим первые 5 для проверки
      console.log('\nПервые 5 блюд:');
      dishes.slice(0, 5).forEach((dish, index) => {
        console.log(`${index + 1}. ${dish.name} (UUID: ${dish.uuid}, ID: ${dish.id})`);
      });
    } catch (error) {
      console.error('Ошибка парсинга JSON:', error.message);
      console.error('Ответ сервера:', data.substring(0, 500));
      process.exit(1);
    }
  });
}).on('error', (error) => {
  console.error('Ошибка запроса:', error.message);
  process.exit(1);
});

