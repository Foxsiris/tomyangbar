// Глобальные настройки для тестов

// Устанавливаем переменные окружения для тестов
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing';

// Мокаем console.log и console.error для чистых тестов
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

// Timeout для асинхронных операций
jest.setTimeout(10000);
