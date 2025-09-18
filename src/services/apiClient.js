// API клиент для подключения к бэкэнду
class ApiClient {
  constructor() {
    // Используем относительные пути для продакшена
    this.baseURL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';
    this.token = localStorage.getItem('tomyangbar_token');
    
    // Request throttling and caching
    this.requestQueue = new Map(); // For deduplicating identical requests
    this.requestCache = new Map(); // For caching responses
    this.retryDelays = new Map(); // For tracking retry delays
    this.maxRetries = 3;
    this.baseRetryDelay = 1000; // 1 second
  }

  // Установка токена
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('tomyangbar_token', token);
    } else {
      localStorage.removeItem('tomyangbar_token');
    }
  }

  // Получение заголовков
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Генерация ключа для кеширования запросов
  getRequestKey(endpoint, options = {}) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${endpoint}:${body}`;
  }

  // Проверка, можно ли кешировать ответ
  isCacheable(endpoint, method) {
    // Кешируем только GET запросы для определенных эндпоинтов
    const cacheableEndpoints = [
      '/menu/categories',
      '/menu/dishes',
      '/menu/popular',
      '/orders/stats',
      '/admin/stats'
    ];
    return method === 'GET' && cacheableEndpoints.some(ep => endpoint.includes(ep));
  }

  // Задержка для retry
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Базовый метод для запросов с retry логикой
  async request(endpoint, options = {}, retryCount = 0) {
    const requestKey = this.getRequestKey(endpoint, options);
    const method = options.method || 'GET';
    
    // Проверяем кеш для GET запросов
    if (this.isCacheable(endpoint, method)) {
      const cached = this.requestCache.get(requestKey);
      if (cached && Date.now() - cached.timestamp < 30000) { // 30 секунд кеш
        return cached.data;
      }
    }

    // Проверяем, есть ли уже такой запрос в процессе
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey);
    }

    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    // Создаем промис для дедупликации
    const requestPromise = this.executeRequest(url, config, endpoint, requestKey, retryCount);
    this.requestQueue.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Удаляем из очереди после завершения
      this.requestQueue.delete(requestKey);
    }
  }

  // Выполнение запроса с обработкой ошибок
  async executeRequest(url, config, endpoint, requestKey, retryCount) {
    try {
      const response = await fetch(url, config);
      
      // Если токен истек, удаляем его
      if (response.status === 401) {
        this.setToken(null);
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
      }

      // Обработка 429 ошибки (Too Many Requests)
      if (response.status === 429) {
        if (retryCount < this.maxRetries) {
          const delay = this.baseRetryDelay * Math.pow(2, retryCount); // Exponential backoff
          console.warn(`Rate limited. Retrying in ${delay}ms... (attempt ${retryCount + 1}/${this.maxRetries})`);
          await this.delay(delay);
          return this.request(endpoint, config, retryCount + 1);
        } else {
          throw new Error('Превышен лимит запросов. Попробуйте позже.');
        }
      }

      let data;
      try {
        data = await response.json();
      } catch {
        // Если ответ не JSON (например, "Too many requests" текст)
        if (response.status === 429) {
          throw new Error('Превышен лимит запросов. Попробуйте позже.');
        }
        throw new Error('Ошибка парсинга ответа сервера');
      }
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Ошибка сервера');
      }

      // Кешируем успешные GET запросы
      if (this.isCacheable(endpoint, config.method || 'GET')) {
        this.requestCache.set(requestKey, {
          data,
          timestamp: Date.now()
        });
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // GET запрос
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST запрос
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT запрос
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE запрос
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Методы для работы с пользователями
  async registerUser(userData) {
    return this.post('/users/register', userData);
  }

  async loginUser(credentials) {
    const response = await this.post('/users/login', credentials);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async adminLogin(credentials) {
    const response = await this.post('/users/admin/login', credentials);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async getUserProfile() {
    return this.get('/users/profile');
  }

  // Методы для работы с заказами
  async createOrder(orderData) {
    return this.post('/orders', orderData);
  }

  async getAllOrders() {
    return this.get('/orders');
  }

  async getOrdersByStatus(status) {
    return this.get(`/orders?status=${status}`);
  }

  async getUserOrders() {
    return this.get('/orders/user');
  }

  async updateOrderStatus(orderId, status) {
    return this.put(`/orders/${orderId}/status`, { status });
  }

  async getOrderStats() {
    return this.get('/orders/stats');
  }

  // Методы для работы с меню
  async getCategories() {
    return this.get('/menu/categories');
  }

  async getDishes() {
    return this.get('/menu/dishes');
  }

  async getDishesByCategory(categoryId) {
    return this.get(`/menu/dishes?category=${categoryId}`);
  }

  async getPopularDishes() {
    return this.get('/menu/dishes?popular=true');
  }

  async getDishById(id) {
    return this.get(`/menu/dishes?id=${id}`);
  }

  async searchDishes(query) {
    return this.get(`/menu/search?q=${encodeURIComponent(query)}`);
  }

  // Методы для админа
  async getAdminStats() {
    return this.get('/admin/stats');
  }

  async getAdminOrders() {
    return this.get('/admin/orders');
  }

  async updateDish(dishId, updates) {
    return this.put(`/admin/menu/dishes/${dishId}`, updates);
  }

  async createDish(dishData) {
    return this.post('/admin/menu/dishes', dishData);
  }

  async deleteDish(dishId) {
    return this.delete(`/admin/menu/dishes/${dishId}`);
  }

  async createCategory(categoryData) {
    return this.post('/admin/menu/categories', categoryData);
  }

  async updateCategory(categoryId, updates) {
    return this.put(`/admin/menu/categories/${categoryId}`, updates);
  }

  async deleteCategory(categoryId) {
    return this.delete(`/admin/menu/categories/${categoryId}`);
  }

  // Методы для работы с корзиной
  async getOrCreateCart(sessionId = null) {
    return this.post('/cart/get-or-create', { sessionId });
  }

  async addToCart(cartId, dish) {
    return this.post('/cart/add', {
      cartId,
      dishId: dish.id,
      dishName: dish.name,
      price: dish.price,
      quantity: 1,
      imageUrl: dish.image_url
    });
  }

  async updateCartItem(itemId, quantity) {
    return this.put(`/cart/items/${itemId}`, { quantity });
  }

  async removeFromCart(itemId) {
    return this.delete(`/cart/items/${itemId}`);
  }

  async clearCart(cartId) {
    return this.delete(`/cart/${cartId}/clear`);
  }

  // Очистка кеша
  clearCache() {
    this.requestCache.clear();
  }

  // Очистка кеша для определенного эндпоинта
  clearCacheForEndpoint(endpoint) {
    for (const [key] of this.requestCache.entries()) {
      if (key.includes(endpoint)) {
        this.requestCache.delete(key);
      }
    }
  }
}

// Создаем единственный экземпляр API клиента
export const apiClient = new ApiClient();
export default apiClient;
