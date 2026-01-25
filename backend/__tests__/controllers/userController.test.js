/**
 * Тесты для контроллера пользователей
 * Включает тесты системы лояльности
 */

// Мокаем supabase перед импортом контроллера
jest.mock('../../src/config/supabase', () => ({
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn()
      }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn()
      }))
    }))
  }))
}));

const { 
  LOYALTY_CONFIG, 
  calculateLoyaltyLevel, 
  getCashbackPercent,
  getLoyaltyLevelName 
} = require('../../src/controllers/userController');

describe('User Controller - Loyalty System', () => {
  
  describe('LOYALTY_CONFIG', () => {
    
    it('должен иметь бонус за регистрацию 200', () => {
      expect(LOYALTY_CONFIG.REGISTRATION_BONUS).toBe(200);
    });
    
    it('должен иметь три уровня лояльности', () => {
      expect(Object.keys(LOYALTY_CONFIG.LEVELS)).toHaveLength(3);
      expect(LOYALTY_CONFIG.LEVELS).toHaveProperty('bronze');
      expect(LOYALTY_CONFIG.LEVELS).toHaveProperty('silver');
      expect(LOYALTY_CONFIG.LEVELS).toHaveProperty('gold');
    });
    
    it('должен иметь правильные пороги для уровней', () => {
      expect(LOYALTY_CONFIG.LEVELS.bronze.minSpent).toBe(0);
      expect(LOYALTY_CONFIG.LEVELS.silver.minSpent).toBe(80000);
      expect(LOYALTY_CONFIG.LEVELS.gold.minSpent).toBe(100000);
    });
    
    it('должен иметь правильные проценты кэшбэка', () => {
      expect(LOYALTY_CONFIG.LEVELS.bronze.cashbackPercent).toBe(2);
      expect(LOYALTY_CONFIG.LEVELS.silver.cashbackPercent).toBe(3);
      expect(LOYALTY_CONFIG.LEVELS.gold.cashbackPercent).toBe(5);
    });
    
  });

  describe('calculateLoyaltyLevel', () => {
    
    it('должен вернуть bronze для 0 потраченных', () => {
      expect(calculateLoyaltyLevel(0)).toBe('bronze');
    });
    
    it('должен вернуть bronze для суммы меньше 80000', () => {
      expect(calculateLoyaltyLevel(50000)).toBe('bronze');
      expect(calculateLoyaltyLevel(79999)).toBe('bronze');
    });
    
    it('должен вернуть silver для суммы >= 80000 и < 100000', () => {
      expect(calculateLoyaltyLevel(80000)).toBe('silver');
      expect(calculateLoyaltyLevel(90000)).toBe('silver');
      expect(calculateLoyaltyLevel(99999)).toBe('silver');
    });
    
    it('должен вернуть gold для суммы >= 100000', () => {
      expect(calculateLoyaltyLevel(100000)).toBe('gold');
      expect(calculateLoyaltyLevel(500000)).toBe('gold');
      expect(calculateLoyaltyLevel(1000000)).toBe('gold');
    });
    
  });

  describe('getCashbackPercent', () => {
    
    it('должен вернуть 2% для bronze', () => {
      expect(getCashbackPercent('bronze')).toBe(2);
    });
    
    it('должен вернуть 3% для silver', () => {
      expect(getCashbackPercent('silver')).toBe(3);
    });
    
    it('должен вернуть 5% для gold', () => {
      expect(getCashbackPercent('gold')).toBe(5);
    });
    
    it('должен вернуть 2% для неизвестного уровня', () => {
      expect(getCashbackPercent('unknown')).toBe(2);
      expect(getCashbackPercent(null)).toBe(2);
      expect(getCashbackPercent(undefined)).toBe(2);
    });
    
  });

  describe('getLoyaltyLevelName', () => {
    
    it('должен вернуть правильное название для bronze', () => {
      expect(getLoyaltyLevelName('bronze')).toBe('🥉 Бронзовый');
    });
    
    it('должен вернуть правильное название для silver', () => {
      expect(getLoyaltyLevelName('silver')).toBe('🥈 Серебряный');
    });
    
    it('должен вернуть правильное название для gold', () => {
      expect(getLoyaltyLevelName('gold')).toBe('🥇 Золотой');
    });
    
    it('должен вернуть bronze название для неизвестного уровня', () => {
      expect(getLoyaltyLevelName('unknown')).toBe('🥉 Бронзовый');
    });
    
  });

  describe('Расчет бонусов за заказ', () => {
    
    it('должен правильно рассчитать бонусы для bronze уровня', () => {
      const orderTotal = 1000;
      const cashbackPercent = getCashbackPercent('bronze');
      const bonusesEarned = Math.floor(orderTotal * cashbackPercent / 100);
      
      expect(bonusesEarned).toBe(20); // 2% от 1000 = 20
    });
    
    it('должен правильно рассчитать бонусы для silver уровня', () => {
      const orderTotal = 1000;
      const cashbackPercent = getCashbackPercent('silver');
      const bonusesEarned = Math.floor(orderTotal * cashbackPercent / 100);
      
      expect(bonusesEarned).toBe(30); // 3% от 1000 = 30
    });
    
    it('должен правильно рассчитать бонусы для gold уровня', () => {
      const orderTotal = 1000;
      const cashbackPercent = getCashbackPercent('gold');
      const bonusesEarned = Math.floor(orderTotal * cashbackPercent / 100);
      
      expect(bonusesEarned).toBe(50); // 5% от 1000 = 50
    });
    
    it('должен правильно рассчитать бонусы при использовании бонусов', () => {
      const orderTotal = 1000;
      const bonusesUsed = 300;
      const cashbackPercent = getCashbackPercent('gold');
      const bonusesEarned = Math.floor((orderTotal - bonusesUsed) * cashbackPercent / 100);
      
      expect(bonusesEarned).toBe(35); // 5% от 700 = 35
    });
    
  });

});
