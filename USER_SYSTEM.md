# Система управления пользователями

## Обзор

Создана полноценная система управления пользователями с хранением в localStorage, включающая:
- Регистрацию и аутентификацию
- Хранение истории заказов
- Управление профилем пользователя
- Синхронизацию данных

## Файлы системы

### `src/data/usersData.js`
Основной файл для управления пользователями:

**Основные функции:**
- `getUsersData()` - получение всех пользователей
- `createUser(userData)` - создание нового пользователя
- `authenticateUser(email, password)` - аутентификация
- `findUserByEmail(email)` - поиск по email
- `findUserById(id)` - поиск по ID
- `userExists(email)` - проверка существования
- `addOrderToUser(userId, orderData)` - добавление заказа в историю
- `updateUserOrderStatus(userId, orderId, newStatus)` - обновление статуса заказа
- `getUserOrders(userId)` - получение истории заказов
- `getUserStats(userId)` - статистика пользователя

## Структура данных пользователя

```javascript
{
  id: number,                    // Уникальный ID
  name: string,                  // Имя пользователя
  email: string,                 // Email (уникальный)
  phone: string,                 // Телефон
  password: string,              // Пароль (в продакшене должен быть зашифрован)
  avatar: string | null,         // Аватар
  orders: Array,                 // История заказов
  createdAt: string,             // Дата создания
  updatedAt: string,             // Дата обновления
  lastLoginAt: string | null     // Последний вход
}
```

## Как работает система

### 1. Регистрация
```javascript
// В AuthModal.jsx
const userData = createUser({
  name: formData.name,
  email: formData.email,
  phone: formData.phone,
  password: formData.password
});
```

### 2. Аутентификация
```javascript
// В AuthModal.jsx
const userData = authenticateUser(formData.email, formData.password);
```

### 3. Создание заказа
```javascript
// В UserContext.jsx
const addOrder = (orderData) => {
  // Создаем заказ в общей системе
  const newOrder = addNewOrder(orderData, user.id);
  
  // Добавляем в историю пользователя
  addOrderToUser(user.id, newOrder);
  
  return newOrder;
};
```

### 4. Обновление статуса заказа
```javascript
// В UserContext.jsx
const updateOrderStatus = (orderId, newStatus) => {
  // Обновляем в истории пользователя
  updateUserOrderStatus(user.id, orderId, newStatus);
  
  // Обновляем локальное состояние
  setUser(prev => ({ ...prev, orders: updatedOrders }));
};
```

## Тестовые пользователи

При первом запуске создаются тестовые пользователи:

1. **Админ:**
   - Email: `admin@test.com`
   - Пароль: `admin123`

2. **Пользователь:**
   - Email: `user@test.com`
   - Пароль: `user123`

## Безопасность

⚠️ **Важные замечания для продакшена:**

1. **Пароли:** В текущей версии пароли хранятся в открытом виде. В продакшене необходимо:
   - Хешировать пароли (bcrypt, scrypt)
   - Использовать соль для хеширования
   - Никогда не передавать пароли в открытом виде

2. **Хранение:** localStorage не подходит для продакшена:
   - Использовать серверную базу данных
   - Реализовать JWT токены
   - Добавить HTTPS

3. **Валидация:** Добавить серверную валидацию:
   - Проверка email на сервере
   - Защита от SQL инъекций
   - Rate limiting для попыток входа

## API для продакшена

### Регистрация
```javascript
POST /api/auth/register
{
  "name": "Имя пользователя",
  "email": "user@example.com",
  "phone": "+7 (999) 123-45-67",
  "password": "securePassword123"
}
```

### Аутентификация
```javascript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "Имя пользователя",
    "email": "user@example.com",
    "phone": "+7 (999) 123-45-67"
  }
}
```

### Получение истории заказов
```javascript
GET /api/users/orders
Headers: { "Authorization": "Bearer jwt_token" }

Response:
{
  "orders": [
    {
      "id": 1,
      "items": [...],
      "total": 1500,
      "status": "completed",
      "createdAt": "2024-01-15T14:30:00"
    }
  ]
}
```

## Статистика пользователя

Система предоставляет статистику:
- Общее количество заказов
- Общая сумма потраченных денег
- Количество завершенных заказов
- Средний чек
- Любимые блюда
- Дата регистрации
- Дата последнего заказа

## Интеграция с существующими компонентами

### AuthModal
- Использует `createUser()` и `authenticateUser()`
- Показывает ошибки валидации
- Проверяет существование пользователя

### UserContext
- Интегрирован с системой пользователей
- Синхронизирует заказы
- Обновляет статусы

### Profile
- Загружает заказы из истории пользователя
- Отображает статистику
- Позволяет редактировать профиль

## Миграция на сервер

Для миграции на серверную архитектуру:

1. **Создать API endpoints** для всех функций из `usersData.js`
2. **Заменить localStorage** на HTTP запросы
3. **Добавить JWT токены** для аутентификации
4. **Реализовать middleware** для проверки токенов
5. **Добавить валидацию** на сервере
6. **Настроить базу данных** (PostgreSQL, MongoDB, etc.)

## Примеры использования

### Проверка существования пользователя
```javascript
if (userExists('user@example.com')) {
  console.log('Пользователь уже существует');
}
```

### Получение статистики
```javascript
const stats = getUserStats(userId);
console.log(`Пользователь сделал ${stats.totalOrders} заказов`);
console.log(`Потратил ${stats.totalSpent} рублей`);
```

### Обновление профиля
```javascript
const updatedUser = updateUser(userId, {
  name: 'Новое имя',
  phone: '+7 (999) 999-99-99'
});
```

Система готова к использованию и легко расширяется для добавления новых функций!
