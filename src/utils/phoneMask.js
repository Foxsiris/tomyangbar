// Утилиты для работы с маской российского номера телефона

// Применение маски к номеру телефона
export const applyPhoneMask = (value) => {
  // Удаляем все символы кроме цифр
  const numbers = value.replace(/\D/g, '');
  
  // Если номер начинается с 8, заменяем на 7
  let formattedNumbers = numbers;
  if (numbers.startsWith('8')) {
    formattedNumbers = '7' + numbers.slice(1);
  }
  
  // Если номер не начинается с 7, добавляем 7
  if (!formattedNumbers.startsWith('7') && formattedNumbers.length > 0) {
    formattedNumbers = '7' + formattedNumbers;
  }
  
  // Ограничиваем длину до 11 цифр (7 + 10 цифр)
  formattedNumbers = formattedNumbers.slice(0, 11);
  
  // Применяем маску +7 (XXX) XXX-XX-XX
  if (formattedNumbers.length === 0) {
    return '';
  } else if (formattedNumbers.length <= 1) {
    return '+7';
  } else if (formattedNumbers.length <= 4) {
    return `+7 (${formattedNumbers.slice(1)}`;
  } else if (formattedNumbers.length <= 7) {
    return `+7 (${formattedNumbers.slice(1, 4)}) ${formattedNumbers.slice(4)}`;
  } else if (formattedNumbers.length <= 9) {
    return `+7 (${formattedNumbers.slice(1, 4)}) ${formattedNumbers.slice(4, 7)}-${formattedNumbers.slice(7)}`;
  } else {
    return `+7 (${formattedNumbers.slice(1, 4)}) ${formattedNumbers.slice(4, 7)}-${formattedNumbers.slice(7, 9)}-${formattedNumbers.slice(9)}`;
  }
};

// Получение чистого номера телефона (только цифры)
export const getCleanPhoneNumber = (maskedPhone) => {
  return maskedPhone.replace(/\D/g, '');
};

// Валидация российского номера телефона
export const validateRussianPhone = (phone) => {
  const cleanPhone = getCleanPhoneNumber(phone);
  
  // Проверяем, что номер начинается с 7 и имеет 11 цифр
  if (cleanPhone.length !== 11) {
    return false;
  }
  
  if (!cleanPhone.startsWith('7')) {
    return false;
  }
  
  // Проверяем, что вторая цифра (код оператора) корректная
  const operatorCode = cleanPhone.slice(1, 4);
  const validOperatorCodes = [
    '900', '901', '902', '903', '904', '905', '906', '907', '908', '909', // МТС
    '910', '911', '912', '913', '914', '915', '916', '917', '918', '919', // МТС
    '920', '921', '922', '923', '924', '925', '926', '927', '928', '929', // МТС
    '930', '931', '932', '933', '934', '936', '937', '938', '939', // МТС
    '950', '951', '952', '953', '954', '955', '956', '957', '958', '959', // Билайн
    '960', '961', '962', '963', '964', '965', '966', '967', '968', '969', // Билайн
    '970', '971', '977', '978', '980', '981', '982', '983', '984', '985', '986', '987', '988', '989', // Билайн
    '990', '991', '992', '993', '994', '995', '996', '997', '998', '999', // МегаФон
    '800', '801', '802', '803', '804', '805', '806', '807', '808', '809', // Другие операторы
    '820', '821', '822', '823', '824', '825', '826', '827', '828', '829', // Другие операторы
    '840', '841', '842', '843', '844', '845', '846', '847', '848', '849', // Другие операторы
    '860', '861', '862', '863', '864', '865', '866', '867', '868', '869', // Другие операторы
    '870', '871', '872', '873', '874', '875', '876', '877', '878', '879', // Другие операторы
    '880', '881', '882', '883', '884', '885', '886', '887', '888', '889', // Другие операторы
    '890', '891', '892', '893', '894', '895', '896', '897', '898', '899'  // Другие операторы
  ];
  
  return validOperatorCodes.includes(operatorCode);
};

// Нормализация номера телефона для хранения
export const normalizePhoneNumber = (phone) => {
  const cleanPhone = getCleanPhoneNumber(phone);
  
  // Если номер начинается с 8, заменяем на 7
  if (cleanPhone.startsWith('8')) {
    return '7' + cleanPhone.slice(1);
  }
  
  // Если номер не начинается с 7, добавляем 7
  if (!cleanPhone.startsWith('7') && cleanPhone.length > 0) {
    return '7' + cleanPhone;
  }
  
  return cleanPhone;
};

// Форматирование номера для отображения
export const formatPhoneForDisplay = (phone) => {
  const cleanPhone = normalizePhoneNumber(phone);
  
  if (cleanPhone.length === 11 && cleanPhone.startsWith('7')) {
    return `+7 (${cleanPhone.slice(1, 4)}) ${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7, 9)}-${cleanPhone.slice(9)}`;
  }
  
  return phone; // Возвращаем как есть, если формат не подходит
};
