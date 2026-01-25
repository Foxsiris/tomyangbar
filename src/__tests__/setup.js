// Глобальные настройки для тестов

// Мокаем localStorage
const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
}
global.localStorage = localStorageMock

// Мокаем fetch
global.fetch = async () => ({
  ok: true,
  json: async () => ({})
})
