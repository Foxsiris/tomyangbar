/**
 * Тесты для логики системы лояльности
 */

describe('Loyalty System Logic', () => {
  
  describe('Максимальное использование бонусов', () => {
    
    it('можно использовать 100% суммы заказа бонусами', () => {
      const orderTotal = 500;
      const userBonusBalance = 1000;
      const requestedBonuses = 500;
      
      const maxBonusesToUse = Math.min(userBonusBalance, orderTotal);
      const actualBonusesToUse = Math.min(requestedBonuses, maxBonusesToUse);
      
      expect(actualBonusesToUse).toBe(500);
      expect(orderTotal - actualBonusesToUse).toBe(0); // Заказ полностью оплачен бонусами
    });
    
    it('нельзя использовать больше бонусов чем есть на балансе', () => {
      const orderTotal = 1000;
      const userBonusBalance = 300;
      const requestedBonuses = 1000;
      
      const maxBonusesToUse = Math.min(userBonusBalance, orderTotal);
      const actualBonusesToUse = Math.min(requestedBonuses, maxBonusesToUse);
      
      expect(actualBonusesToUse).toBe(300);
    });
    
    it('нельзя использовать больше бонусов чем сумма заказа', () => {
      const orderTotal = 200;
      const userBonusBalance = 1000;
      const requestedBonuses = 500;
      
      const maxBonusesToUse = Math.min(userBonusBalance, orderTotal);
      const actualBonusesToUse = Math.min(requestedBonuses, maxBonusesToUse);
      
      expect(actualBonusesToUse).toBe(200);
    });
    
  });

  describe('Прогресс к следующему уровню', () => {
    
    const getProgress = (level, totalSpent) => {
      const LEVELS = {
        bronze: { minSpent: 0 },
        silver: { minSpent: 80000 },
        gold: { minSpent: 100000 }
      };
      
      if (level === 'gold') {
        return { progress: 100, remaining: 0 };
      }
      
      if (level === 'silver') {
        const remaining = LEVELS.gold.minSpent - totalSpent;
        return {
          progress: (totalSpent / LEVELS.gold.minSpent) * 100,
          remaining: remaining > 0 ? remaining : 0
        };
      }
      
      const remaining = LEVELS.silver.minSpent - totalSpent;
      return {
        progress: (totalSpent / LEVELS.silver.minSpent) * 100,
        remaining: remaining > 0 ? remaining : 0
      };
    };
    
    it('должен показывать 0% прогресса для нового пользователя', () => {
      const result = getProgress('bronze', 0);
      expect(result.progress).toBe(0);
      expect(result.remaining).toBe(80000);
    });
    
    it('должен показывать 50% прогресса при 40000 потраченных (bronze)', () => {
      const result = getProgress('bronze', 40000);
      expect(result.progress).toBe(50);
      expect(result.remaining).toBe(40000);
    });
    
    it('должен показывать прогресс к gold для silver уровня', () => {
      const result = getProgress('silver', 90000);
      expect(result.progress).toBe(90);
      expect(result.remaining).toBe(10000);
    });
    
    it('должен показывать 100% для gold уровня', () => {
      const result = getProgress('gold', 150000);
      expect(result.progress).toBe(100);
      expect(result.remaining).toBe(0);
    });
    
  });

  describe('Переход между уровнями', () => {
    
    const calculateLevel = (totalSpent) => {
      if (totalSpent >= 100000) return 'gold';
      if (totalSpent >= 80000) return 'silver';
      return 'bronze';
    };
    
    it('должен оставаться на bronze при покупке менее 80000', () => {
      const scenarios = [
        { spent: 0, orderAmount: 5000 },
        { spent: 30000, orderAmount: 10000 },
        { spent: 75000, orderAmount: 4000 }
      ];
      
      scenarios.forEach(({ spent, orderAmount }) => {
        const newTotal = spent + orderAmount;
        expect(calculateLevel(newTotal)).toBe('bronze');
      });
    });
    
    it('должен перейти на silver при достижении 80000', () => {
      const currentSpent = 75000;
      const orderAmount = 5000;
      const newTotal = currentSpent + orderAmount;
      
      expect(calculateLevel(currentSpent)).toBe('bronze');
      expect(calculateLevel(newTotal)).toBe('silver');
    });
    
    it('должен перейти на gold при достижении 100000', () => {
      const currentSpent = 95000;
      const orderAmount = 5000;
      const newTotal = currentSpent + orderAmount;
      
      expect(calculateLevel(currentSpent)).toBe('silver');
      expect(calculateLevel(newTotal)).toBe('gold');
    });
    
  });

});
