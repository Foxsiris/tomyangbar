/**
 * Тесты для логики системы лояльности на фронтенде
 */

import { describe, it, expect } from 'vitest'

describe('Loyalty Utils', () => {
  
  const LOYALTY_CONFIG = {
    REGISTRATION_BONUS: 200,
    LEVELS: {
      bronze: { minSpent: 0, cashbackPercent: 2 },
      silver: { minSpent: 80000, cashbackPercent: 3 },
      gold: { minSpent: 100000, cashbackPercent: 5 }
    }
  }

  describe('getLevelFromTotalSpent', () => {
    
    const getLevelFromTotalSpent = (totalSpent) => {
      if (totalSpent >= LOYALTY_CONFIG.LEVELS.gold.minSpent) return 'gold'
      if (totalSpent >= LOYALTY_CONFIG.LEVELS.silver.minSpent) return 'silver'
      return 'bronze'
    }
    
    it('должен вернуть bronze для нового пользователя', () => {
      expect(getLevelFromTotalSpent(0)).toBe('bronze')
    })
    
    it('должен вернуть bronze для суммы < 80000', () => {
      expect(getLevelFromTotalSpent(50000)).toBe('bronze')
    })
    
    it('должен вернуть silver для суммы >= 80000', () => {
      expect(getLevelFromTotalSpent(80000)).toBe('silver')
      expect(getLevelFromTotalSpent(95000)).toBe('silver')
    })
    
    it('должен вернуть gold для суммы >= 100000', () => {
      expect(getLevelFromTotalSpent(100000)).toBe('gold')
      expect(getLevelFromTotalSpent(200000)).toBe('gold')
    })
    
  })

  describe('getCashbackPercent', () => {
    
    const getCashbackPercent = (level) => {
      return LOYALTY_CONFIG.LEVELS[level]?.cashbackPercent || 2
    }
    
    it('должен вернуть правильный процент для каждого уровня', () => {
      expect(getCashbackPercent('bronze')).toBe(2)
      expect(getCashbackPercent('silver')).toBe(3)
      expect(getCashbackPercent('gold')).toBe(5)
    })
    
    it('должен вернуть 2% для неизвестного уровня', () => {
      expect(getCashbackPercent('unknown')).toBe(2)
    })
    
  })

  describe('calculateBonusesToEarn', () => {
    
    const calculateBonusesToEarn = (amount, level) => {
      const cashbackPercent = LOYALTY_CONFIG.LEVELS[level]?.cashbackPercent || 2
      return Math.floor(amount * cashbackPercent / 100)
    }
    
    it('должен рассчитать бонусы для bronze', () => {
      expect(calculateBonusesToEarn(1000, 'bronze')).toBe(20)
    })
    
    it('должен рассчитать бонусы для silver', () => {
      expect(calculateBonusesToEarn(1000, 'silver')).toBe(30)
    })
    
    it('должен рассчитать бонусы для gold', () => {
      expect(calculateBonusesToEarn(1000, 'gold')).toBe(50)
    })
    
    it('должен округлять вниз', () => {
      expect(calculateBonusesToEarn(999, 'bronze')).toBe(19) // 2% от 999 = 19.98
    })
    
  })

  describe('getMaxBonusesToUse', () => {
    
    const getMaxBonusesToUse = (orderTotal, bonusBalance) => {
      // Бонусами можно оплатить 100% покупки
      return Math.min(bonusBalance, Math.floor(orderTotal))
    }
    
    it('должен вернуть баланс если он меньше суммы заказа', () => {
      expect(getMaxBonusesToUse(1000, 500)).toBe(500)
    })
    
    it('должен вернуть сумму заказа если баланс больше', () => {
      expect(getMaxBonusesToUse(500, 1000)).toBe(500)
    })
    
    it('должен округлять сумму заказа вниз', () => {
      expect(getMaxBonusesToUse(499.99, 1000)).toBe(499)
    })
    
  })

  describe('getProgressToNextLevel', () => {
    
    const getProgressToNextLevel = (level, totalSpent) => {
      if (level === 'gold') {
        return { progress: 100, remaining: 0, nextLevel: null }
      }
      
      const nextLevelThreshold = level === 'silver' 
        ? LOYALTY_CONFIG.LEVELS.gold.minSpent 
        : LOYALTY_CONFIG.LEVELS.silver.minSpent
      
      const remaining = Math.max(0, nextLevelThreshold - totalSpent)
      const progress = Math.min(100, (totalSpent / nextLevelThreshold) * 100)
      
      return {
        progress: Math.round(progress),
        remaining,
        nextLevel: level === 'silver' ? 'gold' : 'silver'
      }
    }
    
    it('должен показать 100% для gold уровня', () => {
      const result = getProgressToNextLevel('gold', 150000)
      expect(result.progress).toBe(100)
      expect(result.remaining).toBe(0)
      expect(result.nextLevel).toBe(null)
    })
    
    it('должен рассчитать прогресс для bronze', () => {
      const result = getProgressToNextLevel('bronze', 40000)
      expect(result.progress).toBe(50)
      expect(result.remaining).toBe(40000)
      expect(result.nextLevel).toBe('silver')
    })
    
    it('должен рассчитать прогресс для silver', () => {
      const result = getProgressToNextLevel('silver', 90000)
      expect(result.progress).toBe(90)
      expect(result.remaining).toBe(10000)
      expect(result.nextLevel).toBe('gold')
    })
    
  })

  describe('formatBonusBalance', () => {
    
    const formatBonusBalance = (balance) => {
      return new Intl.NumberFormat('ru-RU').format(balance)
    }
    
    it('должен форматировать баланс с разделителями', () => {
      // Intl.NumberFormat использует неразрывный пробел (U+00A0)
      expect(formatBonusBalance(1000)).toContain('1')
      expect(formatBonusBalance(1000)).toContain('000')
      expect(formatBonusBalance(10000)).toContain('10')
    })
    
    it('должен обработать нулевой баланс', () => {
      expect(formatBonusBalance(0)).toBe('0')
    })
    
  })

  describe('getLevelName', () => {
    
    const getLevelName = (level) => {
      const names = {
        bronze: '🥉 Бронзовый',
        silver: '🥈 Серебряный',
        gold: '🥇 Золотой'
      }
      return names[level] || '🥉 Бронзовый'
    }
    
    it('должен вернуть правильное название уровня', () => {
      expect(getLevelName('bronze')).toBe('🥉 Бронзовый')
      expect(getLevelName('silver')).toBe('🥈 Серебряный')
      expect(getLevelName('gold')).toBe('🥇 Золотой')
    })
    
    it('должен вернуть bronze для неизвестного уровня', () => {
      expect(getLevelName('unknown')).toBe('🥉 Бронзовый')
    })
    
  })

})
