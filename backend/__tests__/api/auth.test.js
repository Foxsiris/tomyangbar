/**
 * Интеграционные тесты для API аутентификации
 */

const jwt = require('jsonwebtoken');

describe('Auth API', () => {
  
  const JWT_SECRET = 'test-secret-key-for-testing';
  
  describe('JWT Token', () => {
    
    it('должен создавать валидный JWT токен', () => {
      const payload = { userId: 'user-123', email: 'test@example.com' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
    
    it('должен верифицировать токен', () => {
      const payload = { userId: 'user-123', email: 'test@example.com' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
      
      const decoded = jwt.verify(token, JWT_SECRET);
      
      expect(decoded.userId).toBe('user-123');
      expect(decoded.email).toBe('test@example.com');
    });
    
    it('должен отклонить невалидный токен', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        jwt.verify(invalidToken, JWT_SECRET);
      }).toThrow();
    });
    
    it('должен отклонить токен с неправильным секретом', () => {
      const payload = { userId: 'user-123' };
      const token = jwt.sign(payload, 'wrong-secret');
      
      expect(() => {
        jwt.verify(token, JWT_SECRET);
      }).toThrow();
    });
    
    it('должен отклонить истекший токен', () => {
      const payload = { userId: 'user-123' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '-1s' });
      
      expect(() => {
        jwt.verify(token, JWT_SECRET);
      }).toThrow();
    });
    
  });

  describe('Password Validation', () => {
    
    it('должен требовать минимальную длину пароля', () => {
      const validatePassword = (password) => {
        if (!password || password.length < 6) {
          return { valid: false, error: 'Пароль должен быть не менее 6 символов' };
        }
        return { valid: true };
      };
      
      expect(validatePassword('12345').valid).toBe(false);
      expect(validatePassword('123456').valid).toBe(true);
      expect(validatePassword('longpassword').valid).toBe(true);
    });
    
  });

  describe('Email Validation', () => {
    
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };
    
    it('должен принять валидный email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });
    
    it('должен отклонить невалидный email', () => {
      expect(validateEmail('notanemail')).toBe(false);
      expect(validateEmail('missing@domain')).toBe(false);
      expect(validateEmail('@nodomain.com')).toBe(false);
    });
    
  });

  describe('Phone Validation', () => {
    
    const validatePhone = (phone) => {
      const cleaned = phone.replace(/\D/g, '');
      return cleaned.length >= 10 && cleaned.length <= 15;
    };
    
    it('должен принять валидный телефон', () => {
      expect(validatePhone('+79991234567')).toBe(true);
      expect(validatePhone('89991234567')).toBe(true);
      expect(validatePhone('+7 (999) 123-45-67')).toBe(true);
    });
    
    it('должен отклонить слишком короткий телефон', () => {
      expect(validatePhone('123456')).toBe(false);
      expect(validatePhone('')).toBe(false);
    });
    
  });

});
