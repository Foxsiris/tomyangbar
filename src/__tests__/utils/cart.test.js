/**
 * Тесты для логики корзины
 */

import { describe, it, expect } from 'vitest'

describe('Cart Utils', () => {
  
  describe('calculateItemTotal', () => {
    
    const calculateItemTotal = (item) => {
      return (item.price || 0) * (item.quantity || 1)
    }
    
    it('должен рассчитать общую стоимость товара', () => {
      const item = { price: 500, quantity: 3 }
      expect(calculateItemTotal(item)).toBe(1500)
    })
    
    it('должен вернуть цену если quantity = 1', () => {
      const item = { price: 500, quantity: 1 }
      expect(calculateItemTotal(item)).toBe(500)
    })
    
    it('должен вернуть 0 если нет цены', () => {
      const item = { quantity: 3 }
      expect(calculateItemTotal(item)).toBe(0)
    })
    
  })

  describe('calculateCartTotal', () => {
    
    const calculateCartTotal = (items) => {
      return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }
    
    it('должен рассчитать общую сумму корзины', () => {
      const items = [
        { price: 500, quantity: 2 },
        { price: 300, quantity: 1 },
        { price: 200, quantity: 3 }
      ]
      
      expect(calculateCartTotal(items)).toBe(1900) // 1000 + 300 + 600
    })
    
    it('должен вернуть 0 для пустой корзины', () => {
      expect(calculateCartTotal([])).toBe(0)
    })
    
  })

  describe('calculateFinalTotal', () => {
    
    const calculateFinalTotal = (itemsTotal, deliveryFee, bonusesToUse) => {
      const subtotal = itemsTotal + deliveryFee
      return Math.max(0, subtotal - bonusesToUse)
    }
    
    it('должен рассчитать итоговую сумму с доставкой', () => {
      expect(calculateFinalTotal(1000, 200, 0)).toBe(1200)
    })
    
    it('должен рассчитать итоговую сумму с бонусами', () => {
      expect(calculateFinalTotal(1000, 200, 300)).toBe(900)
    })
    
    it('должен вернуть 0 если бонусы покрывают всю сумму', () => {
      expect(calculateFinalTotal(1000, 0, 1500)).toBe(0)
    })
    
    it('не должен возвращать отрицательное значение', () => {
      expect(calculateFinalTotal(500, 0, 1000)).toBe(0)
    })
    
  })

  describe('addToCart', () => {
    
    const addToCart = (cart, item) => {
      const existingIndex = cart.findIndex(i => i.id === item.id)
      
      if (existingIndex >= 0) {
        const newCart = [...cart]
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + 1
        }
        return newCart
      }
      
      return [...cart, { ...item, quantity: 1 }]
    }
    
    it('должен добавить новый товар в корзину', () => {
      const cart = []
      const item = { id: '1', name: 'Том Ям', price: 490 }
      
      const newCart = addToCart(cart, item)
      
      expect(newCart).toHaveLength(1)
      expect(newCart[0].quantity).toBe(1)
    })
    
    it('должен увеличить количество существующего товара', () => {
      const cart = [{ id: '1', name: 'Том Ям', price: 490, quantity: 2 }]
      const item = { id: '1', name: 'Том Ям', price: 490 }
      
      const newCart = addToCart(cart, item)
      
      expect(newCart).toHaveLength(1)
      expect(newCart[0].quantity).toBe(3)
    })
    
  })

  describe('removeFromCart', () => {
    
    const removeFromCart = (cart, itemId) => {
      return cart.filter(item => item.id !== itemId)
    }
    
    it('должен удалить товар из корзины', () => {
      const cart = [
        { id: '1', name: 'Том Ям', price: 490, quantity: 1 },
        { id: '2', name: 'Рис', price: 150, quantity: 2 }
      ]
      
      const newCart = removeFromCart(cart, '1')
      
      expect(newCart).toHaveLength(1)
      expect(newCart[0].id).toBe('2')
    })
    
    it('должен вернуть ту же корзину если товар не найден', () => {
      const cart = [{ id: '1', name: 'Том Ям', price: 490, quantity: 1 }]
      
      const newCart = removeFromCart(cart, '999')
      
      expect(newCart).toHaveLength(1)
    })
    
  })

  describe('updateQuantity', () => {
    
    const updateQuantity = (cart, itemId, quantity) => {
      if (quantity <= 0) {
        return cart.filter(item => item.id !== itemId)
      }
      
      return cart.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    }
    
    it('должен обновить количество товара', () => {
      const cart = [{ id: '1', name: 'Том Ям', price: 490, quantity: 1 }]
      
      const newCart = updateQuantity(cart, '1', 5)
      
      expect(newCart[0].quantity).toBe(5)
    })
    
    it('должен удалить товар если количество <= 0', () => {
      const cart = [{ id: '1', name: 'Том Ям', price: 490, quantity: 1 }]
      
      const newCart = updateQuantity(cart, '1', 0)
      
      expect(newCart).toHaveLength(0)
    })
    
  })

  describe('getCartItemsCount', () => {
    
    const getCartItemsCount = (cart) => {
      return cart.reduce((sum, item) => sum + item.quantity, 0)
    }
    
    it('должен вернуть общее количество товаров', () => {
      const cart = [
        { id: '1', quantity: 2 },
        { id: '2', quantity: 3 },
        { id: '3', quantity: 1 }
      ]
      
      expect(getCartItemsCount(cart)).toBe(6)
    })
    
    it('должен вернуть 0 для пустой корзины', () => {
      expect(getCartItemsCount([])).toBe(0)
    })
    
  })

})
