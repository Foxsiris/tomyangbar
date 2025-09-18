import { apiClient } from './apiClient.js';

// Сервис для работы с пользователями
export class UserService {
  // Регистрация нового пользователя
  static async register(userData) {
    try {
      const response = await apiClient.registerUser(userData);
      return response.user;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  // Аутентификация пользователя
  static async authenticate(email, password) {
    try {
      const response = await apiClient.loginUser({ email, password });
      return response.user;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  // Аутентификация по email или телефону
  static async authenticateByEmailOrPhone(identifier, password) {
    try {
      const response = await apiClient.loginUser({ identifier, password });
      return response.user;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  // Поиск пользователя по email
  static async findByEmail(email) {
    try {
      const response = await apiClient.get(`/users/email/${email}`);
      return response.user;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  // Поиск пользователя по телефону
  static async findByPhone(phone) {
    try {
      const response = await apiClient.get(`/users/phone/${phone}`);
      return response.user;
    } catch (error) {
      console.error('Error finding user by phone:', error);
      return null;
    }
  }

  // Поиск пользователя по ID
  static async findById(id) {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.user;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  // Обновление данных пользователя
  static async update(id, updates) {
    try {
      const response = await apiClient.put(`/users/${id}`, updates);
      return response.user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Обновление времени последнего входа
  static async updateLastLogin(id) {
    try {
      await apiClient.put(`/users/${id}/last-login`, {});
    } catch (error) {
      console.error('Error updating last login:', error);
      // Не выбрасываем ошибку, так как это не критично
    }
  }

  // Получение истории заказов пользователя
  static async getUserOrders() {
    try {
      const response = await apiClient.getUserOrders();
      return response.orders;
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw error;
    }
  }

  // Получение статистики пользователя
  static async getUserStats(userId) {
    try {
      const response = await apiClient.get(`/users/${userId}/stats`);
      return response.stats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  // Проверка существования пользователя
  static async userExists(email) {
    try {
      const user = await this.findByEmail(email);
      return !!user;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }

  // Проверка существования пользователя по телефону
  static async userExistsByPhone(phone) {
    try {
      const user = await this.findByPhone(phone);
      return !!user;
    } catch (error) {
      console.error('Error checking user existence by phone:', error);
      return false;
    }
  }

  // Авторизация админа
  static async authenticateAdmin(email, password) {
    try {
      const response = await apiClient.adminLogin({ email, password });
      return response.user;
    } catch (error) {
      console.error('Ошибка авторизации админа:', error);
      throw error;
    }
  }
}
