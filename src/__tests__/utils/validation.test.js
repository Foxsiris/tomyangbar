/**
 * Тесты для функций валидации
 */

import { describe, it, expect } from 'vitest'

describe('Validation Utils', () => {
  
  describe('validateEmail', () => {
    
    const validateEmail = (email) => {
      if (!email) return { valid: false, error: 'Email обязателен' }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return { valid: false, error: 'Некорректный email' }
      }
      return { valid: true }
    }
    
    it('должен принять валидный email', () => {
      expect(validateEmail('test@example.com').valid).toBe(true)
      expect(validateEmail('user.name@domain.ru').valid).toBe(true)
      expect(validateEmail('user+tag@gmail.com').valid).toBe(true)
    })
    
    it('должен отклонить невалидный email', () => {
      expect(validateEmail('notanemail').valid).toBe(false)
      expect(validateEmail('missing@').valid).toBe(false)
      expect(validateEmail('@nodomain.com').valid).toBe(false)
      expect(validateEmail('spaces in@email.com').valid).toBe(false)
    })
    
    it('должен отклонить пустой email', () => {
      expect(validateEmail('').valid).toBe(false)
      expect(validateEmail(null).valid).toBe(false)
    })
    
  })

  describe('validatePhone', () => {
    
    const validatePhone = (phone) => {
      if (!phone) return { valid: false, error: 'Телефон обязателен' }
      const cleaned = phone.replace(/\D/g, '')
      if (cleaned.length < 10 || cleaned.length > 15) {
        return { valid: false, error: 'Некорректный номер телефона' }
      }
      return { valid: true }
    }
    
    it('должен принять валидный телефон', () => {
      expect(validatePhone('+79991234567').valid).toBe(true)
      expect(validatePhone('89991234567').valid).toBe(true)
      expect(validatePhone('+7 (999) 123-45-67').valid).toBe(true)
    })
    
    it('должен отклонить слишком короткий телефон', () => {
      expect(validatePhone('123456').valid).toBe(false)
    })
    
    it('должен отклонить пустой телефон', () => {
      expect(validatePhone('').valid).toBe(false)
    })
    
  })

  describe('validateName', () => {
    
    const validateName = (name) => {
      if (!name) return { valid: false, error: 'Имя обязательно' }
      if (name.trim().length < 2) {
        return { valid: false, error: 'Имя должно быть не менее 2 символов' }
      }
      return { valid: true }
    }
    
    it('должен принять валидное имя', () => {
      expect(validateName('Иван').valid).toBe(true)
      expect(validateName('John Doe').valid).toBe(true)
    })
    
    it('должен отклонить слишком короткое имя', () => {
      expect(validateName('A').valid).toBe(false)
      expect(validateName('  ').valid).toBe(false)
    })
    
    it('должен отклонить пустое имя', () => {
      expect(validateName('').valid).toBe(false)
      expect(validateName(null).valid).toBe(false)
    })
    
  })

  describe('validatePassword', () => {
    
    const validatePassword = (password) => {
      if (!password) return { valid: false, error: 'Пароль обязателен' }
      if (password.length < 6) {
        return { valid: false, error: 'Пароль должен быть не менее 6 символов' }
      }
      return { valid: true }
    }
    
    it('должен принять валидный пароль', () => {
      expect(validatePassword('123456').valid).toBe(true)
      expect(validatePassword('securePassword').valid).toBe(true)
    })
    
    it('должен отклонить слишком короткий пароль', () => {
      expect(validatePassword('12345').valid).toBe(false)
      expect(validatePassword('abc').valid).toBe(false)
    })
    
    it('должен отклонить пустой пароль', () => {
      expect(validatePassword('').valid).toBe(false)
    })
    
  })

  describe('validateAddress', () => {
    
    const validateAddress = (address, deliveryType) => {
      if (deliveryType === 'pickup') return { valid: true }
      if (!address) return { valid: false, error: 'Адрес обязателен для доставки' }
      if (address.trim().length < 10) {
        return { valid: false, error: 'Укажите полный адрес' }
      }
      return { valid: true }
    }
    
    it('должен не требовать адрес для самовывоза', () => {
      expect(validateAddress('', 'pickup').valid).toBe(true)
      expect(validateAddress(null, 'pickup').valid).toBe(true)
    })
    
    it('должен требовать адрес для доставки', () => {
      expect(validateAddress('', 'delivery').valid).toBe(false)
    })
    
    it('должен требовать полный адрес', () => {
      expect(validateAddress('ул.', 'delivery').valid).toBe(false)
      expect(validateAddress('ул. Пушкина, д. 10, кв. 5', 'delivery').valid).toBe(true)
    })
    
  })

  describe('validateOrderForm', () => {
    
    const validateOrderForm = (formData) => {
      const errors = {}
      
      if (!formData.name || formData.name.trim().length < 2) {
        errors.name = 'Введите имя'
      }
      
      if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
        errors.phone = 'Введите корректный телефон'
      }
      
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Введите корректный email'
      }
      
      if (formData.deliveryType === 'delivery' && (!formData.address || formData.address.length < 10)) {
        errors.address = 'Введите полный адрес'
      }
      
      return {
        valid: Object.keys(errors).length === 0,
        errors
      }
    }
    
    it('должен вернуть valid для полностью заполненной формы', () => {
      const formData = {
        name: 'Иван Иванов',
        phone: '+79991234567',
        email: 'test@example.com',
        deliveryType: 'pickup'
      }
      
      expect(validateOrderForm(formData).valid).toBe(true)
    })
    
    it('должен вернуть ошибки для невалидной формы', () => {
      const formData = {
        name: '',
        phone: '123',
        email: 'invalid',
        deliveryType: 'delivery',
        address: ''
      }
      
      const result = validateOrderForm(formData)
      expect(result.valid).toBe(false)
      expect(Object.keys(result.errors)).toHaveLength(4)
    })
    
    it('должен требовать адрес только для доставки', () => {
      const pickupFormData = {
        name: 'Иван',
        phone: '+79991234567',
        email: 'test@example.com',
        deliveryType: 'pickup'
      }
      
      const deliveryFormData = {
        ...pickupFormData,
        deliveryType: 'delivery',
        address: ''
      }
      
      expect(validateOrderForm(pickupFormData).valid).toBe(true)
      expect(validateOrderForm(deliveryFormData).valid).toBe(false)
    })
    
  })

})
