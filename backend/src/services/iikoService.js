/**
 * iiko Cloud API Integration Service
 * Документация: https://api-ru.iiko.services/
 * 
 * Для работы нужны переменные окружения:
 * - IIKO_API_LOGIN: API-ключ из iiko.biz
 * - IIKO_ORGANIZATION_ID: ID организации (можно получить через API)
 * - IIKO_TERMINAL_GROUP_ID: ID терминальной группы (опционально)
 * - IIKO_EXTERNAL_MENU_ID: ID внешнего меню для API v2 (опционально)
 */

const IIKO_API_V1_URL = 'https://api-ru.iiko.services/api/1';
const IIKO_API_V2_URL = 'https://api-ru.iiko.services/api/2';

class IikoService {
  constructor() {
    this.apiLogin = process.env.IIKO_API_LOGIN;
    this.organizationId = process.env.IIKO_ORGANIZATION_ID;
    this.terminalGroupId = process.env.IIKO_TERMINAL_GROUP_ID;
    this.externalMenuId = process.env.IIKO_EXTERNAL_MENU_ID;
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
      const response = await fetch(`${IIKO_API_V1_URL}/access_token`, {
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
    
    const response = await fetch(`${IIKO_API_V1_URL}/organizations`, {
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
    
    const response = await fetch(`${IIKO_API_V1_URL}/terminal_groups`, {
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
   * Получение меню из iiko API v2
   * Возвращает полное меню с категориями, товарами и модификаторами
   */
  async getMenu() {
    // Если есть externalMenuId - используем API v2
    if (this.externalMenuId) {
      return await this.getMenuV2();
    }
    // Иначе - API v1 (номенклатура)
    return await this.getMenuV1();
  }

  /**
   * Получение меню через API v2 (рекомендуется)
   * Требует настройки внешнего меню в iiko
   */
  async getMenuV2() {
    const token = await this.getAccessToken();
    
    const requestBody = {
      externalMenuId: this.externalMenuId,
      organizationIds: [this.organizationId]
    };

    console.log('📤 iiko v2: Запрос меню:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${IIKO_API_V2_URL}/menu/by_id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ iiko v2: Ошибка получения меню:', errorText);
      throw new Error(`Ошибка получения меню v2: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ iiko v2: Меню получено, категорий:', data.itemCategories?.length || 0);
    return data;
  }

  /**
   * Получение номенклатуры через API v1 (старый способ)
   */
  async getMenuV1() {
    const token = await this.getAccessToken();
    
    const response = await fetch(`${IIKO_API_V1_URL}/nomenclature`, {
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
      throw new Error(`Ошибка получения меню v1: ${await response.text()}`);
    }

    return await response.json();
  }

  /**
   * Получение списка внешних меню (для настройки IIKO_EXTERNAL_MENU_ID)
   */
  async getExternalMenus() {
    const token = await this.getAccessToken();
    
    const response = await fetch(`${IIKO_API_V2_URL}/menu`, {
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
      throw new Error(`Ошибка получения списка меню: ${await response.text()}`);
    }

    const data = await response.json();
    console.log('📋 iiko v2: Доступные внешние меню:', JSON.stringify(data, null, 2));
    return data;
  }

  /**
   * Получение типов оплаты из iiko
   */
  async getPaymentTypes() {
    const token = await this.getAccessToken();
    
    const response = await fetch(`${IIKO_API_V1_URL}/payment_types`, {
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
      throw new Error(`Ошибка получения типов оплаты: ${await response.text()}`);
    }

    const data = await response.json();
    console.log('📋 iiko: Типы оплаты:', JSON.stringify(data, null, 2));
    return data;
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
        // Тип заказа: DeliveryByCourier = доставка, DeliveryByClient = самовывоз
        orderServiceType: order.delivery_type === 'delivery' ? 'DeliveryByCourier' : 'DeliveryByClient',
        // Позиции заказа (только с валидным iiko_product_id)
        items: orderItems
          .filter(item => {
            if (!item.iiko_product_id) {
              console.warn(`⚠️ iiko: Пропущено блюдо "${item.dish_name}" (нет iiko_product_id)`);
              return false;
            }
            return true;
          })
          .map(item => ({
            productId: item.iiko_product_id, // UUID продукта в iiko
            type: 'Product',
            amount: item.quantity,
          })),
        // Комментарий к заказу
        comment: order.notes || '',
        // Оплата с paymentTypeId
        payments: [{
          paymentTypeKind: this.mapPaymentMethod(order.payment_method),
          paymentTypeId: this.getPaymentTypeId(order.payment_method),
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

    // Проверяем, есть ли позиции для отправки
    if (iikoOrder.order.items.length === 0) {
      console.warn('⚠️ iiko: Нет позиций с iiko_product_id - заказ не будет отправлен в iiko');
      console.warn('   Добавьте iiko_product_id для блюд в таблице dishes (UUID из номенклатуры iiko)');
      return { skipped: true, reason: 'Нет позиций с iiko_product_id' };
    }

    console.log('📤 iiko: Отправка заказа:', JSON.stringify(iikoOrder, null, 2));

    try {
      const response = await fetch(`${IIKO_API_V1_URL}/deliveries/create`, {
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
   * Маппинг способа оплаты (код)
   */
  mapPaymentMethod(paymentMethod) {
    const mapping = {
      'cash': 'Cash',
      'card': 'Card',
      'sbp': 'Card',
      'online': 'Card'
    };
    return mapping[paymentMethod] || 'Cash';
  }

  /**
   * Маппинг способа оплаты (название для комментария)
   */
  mapPaymentMethodName(paymentMethod) {
    const mapping = {
      'cash': 'Наличными при получении',
      'card': 'Картой при получении',
      'sbp': 'СБП',
      'online': 'Онлайн оплата'
    };
    return mapping[paymentMethod] || 'Наличными';
  }

  /**
   * Получение paymentTypeId для iiko
   * ID взяты из /api/iiko/payment-types
   */
  getPaymentTypeId(paymentMethod) {
    const mapping = {
      'cash': '09322f46-578a-d210-add7-eec222a08871',    // CASH - Наличные
      'card': '6e0221ad-6143-4007-99b5-33a6c131a6af',    // SCARD - Карта сайт
      'sbp': '6e0221ad-6143-4007-99b5-33a6c131a6af',     // SCARD - Карта сайт (для СБП тоже)
      'online': '6e0221ad-6143-4007-99b5-33a6c131a6af'   // SCARD - Карта сайт
    };
    return mapping[paymentMethod] || '09322f46-578a-d210-add7-eec222a08871'; // По умолчанию наличные
  }

  /**
   * Проверка статуса заказа в iiko
   */
  async getOrderStatus(iikoOrderId) {
    const token = await this.getAccessToken();
    
    const response = await fetch(`${IIKO_API_V1_URL}/deliveries/by_id`, {
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

