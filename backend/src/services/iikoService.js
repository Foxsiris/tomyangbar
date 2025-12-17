/**
 * iiko Cloud API Integration Service
 * Документация: https://api-ru.iiko.services/
 * 
 * Для работы нужны переменные окружения:
 * - IIKO_API_LOGIN: API-ключ из iiko.biz
 * - IIKO_ORGANIZATION_ID: ID организации (можно получить через API)
 * - IIKO_TERMINAL_GROUP_ID: ID терминальной группы (опционально)
 */

const IIKO_API_URL = 'https://api-ru.iiko.services/api/1';

class IikoService {
  constructor() {
    this.apiLogin = process.env.IIKO_API_LOGIN;
    this.organizationId = process.env.IIKO_ORGANIZATION_ID;
    this.terminalGroupId = process.env.IIKO_TERMINAL_GROUP_ID;
    this.token = null;
    this.tokenExpires = null;
  }

  /**
   * Получение токена доступа
   * Токен живёт ~1 час, кешируем его
   */
  async getAccessToken() {
    // Если токен есть и не истёк - используем его
    if (this.token && this.tokenExpires && new Date() < this.tokenExpires) {
      return this.token;
    }

    if (!this.apiLogin) {
      throw new Error('IIKO_API_LOGIN не настроен в переменных окружения');
    }

    try {
      const response = await fetch(`${IIKO_API_URL}/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiLogin: this.apiLogin
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ошибка получения токена iiko: ${error}`);
      }

      const data = await response.json();
      this.token = data.token;
      // Токен живёт ~1 час, обновляем за 5 минут до истечения
      this.tokenExpires = new Date(Date.now() + 55 * 60 * 1000);
      
      console.log('✅ iiko: Токен успешно получен');
      return this.token;
    } catch (error) {
      console.error('❌ iiko: Ошибка получения токена:', error.message);
      throw error;
    }
  }

  /**
   * Получение списка организаций
   * Используйте для получения organizationId
   */
  async getOrganizations() {
    const token = await this.getAccessToken();
    
    const response = await fetch(`${IIKO_API_URL}/organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error(`Ошибка получения организаций: ${await response.text()}`);
    }

    return await response.json();
  }

  /**
   * Получение терминальных групп организации
   */
  async getTerminalGroups() {
    const token = await this.getAccessToken();
    
    const response = await fetch(`${IIKO_API_URL}/terminal_groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        organizationIds: [this.organizationId]
      })
    });

    if (!response.ok) {
      throw new Error(`Ошибка получения терминалов: ${await response.text()}`);
    }

    return await response.json();
  }

  /**
   * Получение меню из iiko
   */
  async getMenu() {
    const token = await this.getAccessToken();
    
    const response = await fetch(`${IIKO_API_URL}/nomenclature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        organizationId: this.organizationId
      })
    });

    if (!response.ok) {
      throw new Error(`Ошибка получения меню: ${await response.text()}`);
    }

    return await response.json();
  }

  /**
   * Создание заказа на доставку в iiko
   * @param {Object} order - Заказ из нашей системы
   * @param {Array} orderItems - Элементы заказа
   */
  async createDeliveryOrder(order, orderItems) {
    const token = await this.getAccessToken();

    // Формируем заказ в формате iiko
    const iikoOrder = {
      organizationId: this.organizationId,
      terminalGroupId: this.terminalGroupId,
      order: {
        // Информация о клиенте
        phone: this.formatPhone(order.phone),
        customer: {
          name: order.customer_name,
          // Можно добавить email, если iiko поддерживает
        },
        // Тип заказа
        orderServiceType: order.delivery_type === 'delivery' ? 'DeliveryByClient' : 'DeliveryPickUp',
        // Позиции заказа
        items: orderItems.map(item => ({
          productId: item.iiko_product_id || item.dish_id.toString(), // ID продукта в iiko
          type: 'Product',
          amount: item.quantity,
          // comment: item.comment || '',
        })),
        // Комментарий к заказу
        comment: order.notes || '',
        // Способ оплаты
        payments: [{
          paymentTypeKind: this.mapPaymentMethod(order.payment_method),
          sum: order.final_total,
          isProcessedExternally: order.payment_method !== 'cash'
        }]
      }
    };

    // Если доставка - добавляем адрес
    if (order.delivery_type === 'delivery' && order.address) {
      iikoOrder.order.deliveryPoint = {
        address: {
          street: {
            name: order.address
          },
          house: ''
        }
      };
    }

    console.log('📤 iiko: Отправка заказа:', JSON.stringify(iikoOrder, null, 2));

    try {
      const response = await fetch(`${IIKO_API_URL}/deliveries/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(iikoOrder)
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ iiko: Ошибка создания заказа:', result);
        throw new Error(`Ошибка создания заказа в iiko: ${JSON.stringify(result)}`);
      }

      console.log('✅ iiko: Заказ успешно создан:', result);
      return result;
    } catch (error) {
      console.error('❌ iiko: Ошибка при отправке заказа:', error.message);
      throw error;
    }
  }

  /**
   * Форматирование телефона для iiko (должен быть в формате +7XXXXXXXXXX)
   */
  formatPhone(phone) {
    if (!phone) return '';
    // Убираем все нецифровые символы
    let digits = phone.replace(/\D/g, '');
    // Если начинается с 8, заменяем на 7
    if (digits.startsWith('8') && digits.length === 11) {
      digits = '7' + digits.slice(1);
    }
    // Добавляем + если нет
    return '+' + digits;
  }

  /**
   * Маппинг способа оплаты
   */
  mapPaymentMethod(paymentMethod) {
    const mapping = {
      'cash': 'Cash',
      'card': 'Card',
      'sbp': 'Card', // SBP обычно маппится как карта
      'online': 'Card'
    };
    return mapping[paymentMethod] || 'Cash';
  }

  /**
   * Проверка статуса заказа в iiko
   */
  async getOrderStatus(iikoOrderId) {
    const token = await this.getAccessToken();
    
    const response = await fetch(`${IIKO_API_URL}/deliveries/by_id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        organizationId: this.organizationId,
        orderIds: [iikoOrderId]
      })
    });

    if (!response.ok) {
      throw new Error(`Ошибка получения статуса: ${await response.text()}`);
    }

    return await response.json();
  }

  /**
   * Проверка доступности iiko
   */
  async healthCheck() {
    try {
      await this.getAccessToken();
      return { status: 'ok', message: 'iiko API доступен' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}

// Создаём singleton
const iikoService = new IikoService();

module.exports = iikoService;

