// API клиент для подключения к бэкэнду
class ApiClient {
  constructor() {
    // Определяем базовый URL для API
    // В режиме разработки используем прямой URL к бэкенду
    // В продакшене используем относительные пути (проксируется через nginx)
    const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development' || !import.meta.env.PROD;
    
    // Если указан VITE_API_URL, используем его
    if (import.meta.env.VITE_API_URL) {
      this.baseURL = import.meta.env.VITE_API_URL;
    } else if (isDevelopment) {
      // В разработке используем прямой URL к бэкенду
      this.baseURL = 'http://localhost:3001';
    } else {
      // В продакшене используем относительные пути (nginx проксирует)
      this.baseURL = '';
    }
    
    this.token = localStorage.getItem('tomyangbar_token');
    this.isDev = isDevelopment;
    
    if (isDevelopment) {
      console.log('🔧 API Client initialized, Base URL:', this.baseURL);
    }
    
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
    
    // Всегда берем актуальный токен из localStorage при каждом запросе
    const token = localStorage.getItem('tomyangbar_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
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
    // Не кешируем админские эндпоинты — данные должны быть актуальными
    if (endpoint.includes('/admin/')) return false;
    // Кешируем только GET запросы для определенных эндпоинтов
    const cacheableEndpoints = [
      '/api/menu/categories',
      '/api/menu/dishes',
      '/api/menu/full',
      '/api/menu/popular',
      '/api/news',
      '/api/orders/stats',
      '/api/admin/stats'
    ];
    return method === 'GET' && cacheableEndpoints.some(ep => endpoint.includes(ep));
  }

  // Время кеша в зависимости от эндпоинта
  getCacheDuration(endpoint) {
    if (endpoint.includes('/api/menu/')) return 300000; // 5 минут для меню
    if (endpoint.includes('/api/news')) return 120000;  // 2 минуты для новостей
    return 30000; // 30 секунд по умолчанию
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
      const cacheDuration = this.getCacheDuration(endpoint);
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
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
      if (this.isDev) {
        console.log(`🌐 ${config.method || 'GET'} ${endpoint}`);
      }
      
      // Добавляем таймаут для запросов (30 секунд)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout: запрос превысил время ожидания')), 30000);
      });
      
      const fetchPromise = fetch(url, config);
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
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
        data = JSON.parse(text);
      } catch (parseError) {
        // Если ответ не JSON (например, "Too many requests" текст)
        if (response.status === 429) {
          throw new Error('Превышен лимит запросов. Попробуйте позже.');
        }
        throw new Error('Ошибка парсинга ответа сервера: ' + parseError.message);
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
      if (this.isDev) {
        console.error(`API Error (${endpoint}):`, error.message);
      }
      
      // Обработка сетевых ошибок
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Ошибка сети: не удалось подключиться к серверу. Проверьте подключение к интернету.');
      }
      
      if (error.message.includes('timeout')) {
        throw new Error('Запрос превысил время ожидания. Сервер не отвечает.');
      }
      
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
    const response = await this.post('/api/users/register', userData);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
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

  // Получение ВСЕХ блюд для админа (включая неактивные)
  async getAdminDishes() {
    return this.get('/api/admin/menu/dishes');
  }

  // Получение ВСЕХ категорий для админа (включая неактивные)
  async getAdminCategories() {
    return this.get('/api/admin/menu/categories');
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
    if (!categoryId) {
      throw new Error('Category ID is required');
    }
    return this.delete(`/api/admin/menu/categories/${categoryId}`);
  }

  // Методы для работы с вакансиями
  async submitVacancy(vacancyData) {
    return this.post('/api/vacancies', vacancyData);
  }

  async getVacancies(status = null) {
    const endpoint = status ? `/api/vacancies?status=${status}` : '/api/vacancies';
    return this.get(endpoint);
  }

  async updateVacancyStatus(vacancyId, status, notes = '') {
    return this.request(`/api/vacancies/${vacancyId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    });
  }

  // Методы для работы с новостями
  async getNews(type = null, limit = null) {
    let endpoint = '/api/news';
    const params = [];
    if (type) params.push(`type=${type}`);
    if (limit) params.push(`limit=${limit}`);
    if (params.length > 0) endpoint += '?' + params.join('&');
    return this.get(endpoint);
  }

  async getAllNews(type = null) {
    let endpoint = '/api/news/admin/all';
    if (type) endpoint += `?type=${type}`;
    return this.get(endpoint);
  }

  async createNews(newsData) {
    const result = await this.post('/api/news', newsData);
    this.clearCacheForEndpoint('/api/news');
    return result;
  }

  async updateNews(newsId, updates) {
    const result = await this.put(`/api/news/${newsId}`, updates);
    this.clearCacheForEndpoint('/api/news');
    return result;
  }

  async deleteNews(newsId) {
    const result = await this.delete(`/api/news/${newsId}`);
    this.clearCacheForEndpoint('/api/news');
    return result;
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
      imageUrl: dish.image || dish.image_url,
      weight: dish.weight
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

// Делаем apiClient доступным глобально для очистки кеша
if (typeof window !== 'undefined') {
  window.apiClient = apiClient;
}
