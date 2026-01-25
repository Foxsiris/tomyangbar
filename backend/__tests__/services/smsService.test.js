/**
 * Тесты для SMS сервиса
 */

const { normalizePhone, verifyCode, sendVerificationCode } = require('../../src/services/smsService');

describe('SMS Service', () => {
  
  describe('normalizePhone', () => {
    
    it('должен нормализовать номер с +7', () => {
      expect(normalizePhone('+7 999 123-45-67')).toBe('79991234567');
    });
    
    it('должен заменить 8 на 7 в начале', () => {
      expect(normalizePhone('89991234567')).toBe('79991234567');
    });
    
    it('должен добавить код страны 7 если номер из 10 цифр', () => {
      expect(normalizePhone('9991234567')).toBe('79991234567');
    });
    
    it('должен удалить все нецифровые символы', () => {
      expect(normalizePhone('+7 (999) 123-45-67')).toBe('79991234567');
    });
    
    it('должен обработать номер только с цифрами', () => {
      expect(normalizePhone('79991234567')).toBe('79991234567');
    });
    
  });

  describe('sendVerificationCode', () => {
    
    it('должен отправить код в dev режиме', async () => {
      const result = await sendVerificationCode('+79991234567');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Код отправлен');
      // В dev режиме возвращается код для тестирования
      expect(result.devCode).toBeDefined();
      expect(result.devCode).toMatch(/^\d{4}$/);
    });
    
    it('должен ограничить повторную отправку (rate limiting)', async () => {
      const phone = '+79991234568';
      
      // Первая отправка должна пройти
      await sendVerificationCode(phone);
      
      // Вторая отправка через секунду должна быть заблокирована
      await expect(sendVerificationCode(phone))
        .rejects
        .toThrow(/Подождите/);
    });
    
  });

  describe('verifyCode', () => {
    
    it('должен вернуть ошибку если код не найден', () => {
      const result = verifyCode('+79999999999', '1234');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Код не найден');
    });
    
    it('должен верифицировать правильный код', async () => {
      const phone = '+79991234501';
      const sendResult = await sendVerificationCode(phone);
      
      const result = verifyCode(phone, sendResult.devCode);
      
      expect(result.valid).toBe(true);
    });
    
    it('должен отклонить неправильный код', async () => {
      const phone = '+79991234502';
      await sendVerificationCode(phone);
      
      const result = verifyCode(phone, '0000');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Неверный код');
    });
    
    it('должен заблокировать после 5 неудачных попыток', async () => {
      const phone = '+79991234503';
      await sendVerificationCode(phone);
      
      // 5 неудачных попыток
      for (let i = 0; i < 5; i++) {
        verifyCode(phone, '0000');
      }
      
      // 6-я попытка должна вернуть ошибку (код удалён или превышено количество попыток)
      const result = verifyCode(phone, '1234');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
    
    it('должен удалить код после успешной верификации', async () => {
      const phone = '+79991234504';
      const sendResult = await sendVerificationCode(phone);
      
      // Первая верификация успешна
      const result1 = verifyCode(phone, sendResult.devCode);
      expect(result1.valid).toBe(true);
      
      // Повторная верификация с тем же кодом должна провалиться
      const result2 = verifyCode(phone, sendResult.devCode);
      expect(result2.valid).toBe(false);
    });
    
  });

});
