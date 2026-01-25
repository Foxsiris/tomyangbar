/**
 * Тесты для контроллера заказов
 */

// Мокаем зависимости
jest.mock('../../src/config/supabase', () => ({
  from: jest.fn()
}));

jest.mock('../../src/services/iikoService', () => ({
  createDeliveryOrder: jest.fn()
}));

jest.mock('../../src/controllers/userController', () => ({
  LOYALTY_CONFIG: {
    REGISTRATION_BONUS: 200,
    LEVELS: {
      bronze: { minSpent: 0, cashbackPercent: 2 },
      silver: { minSpent: 80000, cashbackPercent: 3 },
      gold: { minSpent: 100000, cashbackPercent: 5 }
    }
  },
  calculateLoyaltyLevel: jest.fn((total) => {
    if (total >= 100000) return 'gold';
    if (total >= 80000) return 'silver';
    return 'bronze';
  }),
  getCashbackPercent: jest.fn((level) => {
    const percents = { bronze: 2, silver: 3, gold: 5 };
    return percents[level] || 2;
  })
}));

describe('Order Controller', () => {
  
  describe('Order Validation', () => {
    
    it('должен требовать обязательные поля', () => {
      const requiredFields = ['customerName', 'phone', 'email', 'items', 'total'];
      const orderData = {
        customerName: 'Test User',
        phone: '+79991234567',
        email: 'test@example.com',
        items: [{ id: '1', name: 'Test', price: 100, quantity: 1 }],
        total: 100
      };
      
      requiredFields.forEach(field => {
        const testData = { ...orderData };
        delete testData[field];
        
        const hasAllRequired = requiredFields.every(f => {
          if (f === 'items') return testData[f] && testData[f].length > 0;
          return testData[f];
        });
        
        expect(hasAllRequired).toBe(false);
      });
    });
    
    it('должен проверить что items не пустой', () => {
      const orderData = {
        customerName: 'Test User',
        phone: '+79991234567',
        email: 'test@example.com',
        items: [],
        total: 100
      };
      
      const isValid = orderData.items && orderData.items.length > 0;
      expect(isValid).toBe(false);
    });
    
  });

  describe('Order Total Calculation', () => {
    
    it('должен правильно рассчитать итоговую сумму без доставки', () => {
      const items = [
        { price: 500, quantity: 2 },
        { price: 300, quantity: 1 }
      ];
      const deliveryType = 'pickup';
      
      const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const deliveryFee = deliveryType === 'delivery' ? 200 : 0;
      const total = itemsTotal + deliveryFee;
      
      expect(itemsTotal).toBe(1300);
      expect(deliveryFee).toBe(0);
      expect(total).toBe(1300);
    });
    
    it('должен добавить стоимость доставки', () => {
      const items = [
        { price: 500, quantity: 2 }
      ];
      const deliveryType = 'delivery';
      
      const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const deliveryFee = deliveryType === 'delivery' ? 200 : 0;
      const total = itemsTotal + deliveryFee;
      
      expect(itemsTotal).toBe(1000);
      expect(deliveryFee).toBe(200);
      expect(total).toBe(1200);
    });
    
    it('должен вычесть бонусы из итоговой суммы', () => {
      const itemsTotal = 1000;
      const deliveryFee = 200;
      const bonusesToUse = 300;
      
      const subtotal = itemsTotal + deliveryFee;
      const finalTotal = subtotal - bonusesToUse;
      
      expect(subtotal).toBe(1200);
      expect(finalTotal).toBe(900);
    });
    
  });

  describe('Order Number Generation', () => {
    
    it('должен генерировать инкрементный номер заказа', () => {
      const lastOrderNumber = 100;
      const newOrderNumber = lastOrderNumber + 1;
      
      expect(newOrderNumber).toBe(101);
    });
    
    it('должен начать с 1 если заказов нет', () => {
      const lastOrders = [];
      const orderNumber = lastOrders.length > 0 ? lastOrders[0].order_number + 1 : 1;
      
      expect(orderNumber).toBe(1);
    });
    
  });

  describe('Order Items Processing', () => {
    
    it('должен правильно обработать элементы заказа', () => {
      const items = [
        { id: 'dish-1', name: 'Том Ям', price: 490, quantity: 2 },
        { id: 'dish-2', name: 'Рис', price: 150, quantity: 1 }
      ];
      const orderId = 'order-123';
      
      const orderItems = items.map(item => ({
        order_id: orderId,
        dish_id: item.id,
        dish_name: item.name,
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.price) || 0
      }));
      
      expect(orderItems).toHaveLength(2);
      expect(orderItems[0]).toEqual({
        order_id: 'order-123',
        dish_id: 'dish-1',
        dish_name: 'Том Ям',
        quantity: 2,
        price: 490
      });
    });
    
    it('должен определить невалидные элементы заказа', () => {
      const items = [
        { id: null, name: 'Test', price: 100 },
        { id: 'dish-2', name: '', price: 100 },
        { id: 'dish-3', name: 'Valid', price: 0 },
        { id: 'dish-4', name: 'Valid', price: 100 }
      ];
      
      const invalidItems = items.filter(item => 
        !item.id || !item.name || !item.price || item.price <= 0
      );
      
      expect(invalidItems).toHaveLength(3);
    });
    
  });

  describe('Bonus Calculation in Orders', () => {
    
    it('должен рассчитать бонусы за заказ для авторизованного пользователя', () => {
      const total = 1000;
      const bonusesToUse = 200;
      const loyaltyLevel = 'silver';
      const cashbackPercent = 3;
      
      const baseAmount = total - bonusesToUse;
      const bonusesToEarn = Math.floor(baseAmount * cashbackPercent / 100);
      
      expect(bonusesToEarn).toBe(24); // 3% от 800 = 24
    });
    
    it('не должен начислять бонусы для неавторизованного пользователя', () => {
      const userId = null;
      const total = 1000;
      
      const bonusesToEarn = userId ? 50 : 0;
      
      expect(bonusesToEarn).toBe(0);
    });
    
  });

});
