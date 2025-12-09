// API клиент для подключения к бэкэнду
class ApiClient {
  constructor() {
    // Используем URL бэкенда из переменных окружения
    this.baseURL = import.meta.env.VITE_API_URL || 'https://tomyangbarnew.ru';
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
      '/api/menu/categories',
      '/api/menu/dishes',
      '/api/menu/full',
      '/api/menu/popular',
      '/api/orders/stats',
      '/api/admin/stats'
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
      console.log(`apiClient.executeRequest: Making request to ${url}`);
      console.log(`apiClient.executeRequest: Endpoint: ${endpoint}`);
      console.log(`apiClient.executeRequest: Config:`, config);
      
      const response = await fetch(url, config);
      
      console.log(`apiClient.executeRequest: Response status: ${response.status}`);
      console.log(`apiClient.executeRequest: Response ok: ${response.ok}`);
      console.log(`apiClient.executeRequest: Response headers:`, Object.fromEntries(response.headers.entries()));
      
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
        const text = await response.text();
        console.log(`apiClient.executeRequest: Response text (first 500 chars):`, text.substring(0, 500));
        data = JSON.parse(text);
        console.log(`apiClient.executeRequest: Parsed data:`, data);
      } catch (parseError) {
        console.error(`apiClient.executeRequest: JSON parse error:`, parseError);
        // Если ответ не JSON (например, "Too many requests" текст)
        if (response.status === 429) {
          throw new Error('Превышен лимит запросов. Попробуйте позже.');
        }
        throw new Error('Ошибка парсинга ответа сервера: ' + parseError.message);
      }
      
      if (!response.ok) {
        console.error(`apiClient.executeRequest: Response not OK. Status: ${response.status}, Data:`, data);
        throw new Error(data.error || data.message || 'Ошибка сервера');
      }

      // Кешируем успешные GET запросы
      if (this.isCacheable(endpoint, config.method || 'GET')) {
        this.requestCache.set(requestKey, {
          data,
          timestamp: Date.now()
        });
      }

      console.log(`apiClient.executeRequest: Successfully returning data`);
      return data;
    } catch (error) {
      console.error(`apiClient.executeRequest: API Error (${endpoint}):`, error);
      console.error(`apiClient.executeRequest: Error stack:`, error.stack);
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
    return this.post('/api/users/register', userData);
  }

  async loginUser(credentials) {
    const response = await this.post('/api/users/login', credentials);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async adminLogin(credentials) {
    const response = await this.post('/api/users/admin/login', credentials);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async getUserProfile() {
    return this.get('/api/users/profile');
  }

  // Методы для работы с заказами
  async createOrder(orderData) {
    return this.post('/api/orders', orderData);
  }

  async getAllOrders() {
    return this.get('/api/orders');
  }

  async getOrdersByStatus(status) {
    return this.get(`/api/orders?status=${status}`);
  }

  async getUserOrders() {
    return this.get('/api/orders/user');
  }

  async updateOrderStatus(orderId, status) {
    return this.put(`/api/orders/${orderId}/status`, { status });
  }

  async getOrderStats() {
    return this.get('/api/orders/stats');
  }

  // Методы для работы с меню
  async getCategories() {
    return this.get('/api/menu/categories');
  }

  async getDishes() {
    return this.get('/api/menu/dishes');
  }

  async getDishesByCategory(categoryId) {
    return this.get(`/api/menu/dishes?category=${categoryId}`);
  }

  async getPopularDishes() {
    return this.get('/api/menu/dishes?popular=true');
  }

  async getDishById(id) {
    return this.get(`/api/menu/dishes?id=${id}`);
  }

  async searchDishes(query) {
    return this.get(`/api/menu/search?q=${encodeURIComponent(query)}`);
  }

  async getFullMenu() {
    return this.get('/api/menu/full');
  }

  // Методы для админа
  async getAdminStats() {
    return this.get('/api/admin/stats');
  }

  async getAdminOrders() {
    return this.get('/api/admin/orders');
  }

  async updateDish(dishId, updates) {
    return this.put(`/api/admin/menu/dishes/${dishId}`, updates);
  }

  async createDish(dishData) {
    return this.post('/api/admin/menu/dishes', dishData);
  }

  async deleteDish(dishId) {
    return this.delete(`/api/admin/menu/dishes/${dishId}`);
  }

  async createCategory(categoryData) {
    return this.post('/api/admin/menu/categories', categoryData);
  }

  async updateCategory(categoryId, updates) {
    return this.put(`/api/admin/menu/categories/${categoryId}`, updates);
  }

  async deleteCategory(categoryId) {
    return this.delete(`/api/admin/menu/categories/${categoryId}`);
  }

  // Методы для работы с корзиной
  async getOrCreateCart(sessionId = null) {
    return this.post('/api/cart/get-or-create', { sessionId });
  }

  async addToCart(cartId, dish) {
    return this.post('/api/cart/add', {
      cartId,
      dishId: dish.id,
      dishName: dish.name,
      price: dish.price,
      quantity: 1,
      imageUrl: dish.image_url
    });
  }

  async updateCartItem(itemId, quantity) {
    return this.put(`/api/cart/items/${itemId}`, { quantity });
  }

  async removeFromCart(itemId) {
    return this.delete(`/api/cart/items/${itemId}`);
  }

  async clearCart(cartId) {
    return this.delete(`/api/cart/${cartId}/clear`);
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
