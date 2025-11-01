/**
 * Validators - Базовые валидаторы для всего приложения
 */

const validators = {
  /**
   * Проверка email
   * @param {string} email
   * @returns {{isValid: boolean, error: string}}
   */
  email(email) {
    if (!email || email.trim() === '') {
      return { isValid: false, error: 'Email обязателен' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Некорректный формат email' };
    }

    return { isValid: true, error: null };
  },

  /**
   * Проверка телефона (российский формат)
   * @param {string} phone
   * @returns {{isValid: boolean, error: string}}
   */
  phone(phone) {
    if (!phone || phone.trim() === '') {
      return { isValid: true, error: null }; // Телефон опциональный
    }

    // Убираем все символы кроме цифр
    const cleaned = phone.replace(/\D/g, '');

    // Должно быть 11 цифр (начиная с 7 или 8)
    if (cleaned.length !== 11 || !['7', '8'].includes(cleaned[0])) {
      return { isValid: false, error: 'Формат: +7 (999) 999-99-99' };
    }

    return { isValid: true, error: null };
  },

  /**
   * Проверка обязательного поля
   * @param {any} value
   * @param {string} fieldName
   * @returns {{isValid: boolean, error: string}}
   */
  required(value, fieldName = 'Поле') {
    if (value === null || value === undefined || value === '') {
      return { isValid: false, error: `${fieldName} обязательно` };
    }

    if (typeof value === 'string' && value.trim() === '') {
      return { isValid: false, error: `${fieldName} не может быть пустым` };
    }

    return { isValid: true, error: null };
  },

  /**
   * Проверка числа
   * @param {any} value
   * @param {Object} options - {min, max, fieldName}
   * @returns {{isValid: boolean, error: string}}
   */
  number(value, options = {}) {
    const { min, max, fieldName = 'Значение' } = options;

    if (value === '' || value === null || value === undefined) {
      return { isValid: false, error: `${fieldName} обязательно` };
    }

    const num = Number(value);

    if (isNaN(num)) {
      return { isValid: false, error: `${fieldName} должно быть числом` };
    }

    if (min !== undefined && num < min) {
      return { isValid: false, error: `${fieldName} должно быть не менее ${min}` };
    }

    if (max !== undefined && num > max) {
      return { isValid: false, error: `${fieldName} должно быть не более ${max}` };
    }

    return { isValid: true, error: null };
  },

  /**
   * Проверка даты
   * @param {string} date - ISO формат или dd.mm.yyyy
   * @param {Object} options - {notFuture, notPast, fieldName}
   * @returns {{isValid: boolean, error: string}}
   */
  date(date, options = {}) {
    const { notFuture, notPast, fieldName = 'Дата' } = options;

    if (!date || date.trim() === '') {
      return { isValid: false, error: `${fieldName} обязательна` };
    }

    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return { isValid: false, error: 'Некорректная дата' };
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);

    if (notFuture && dateObj > now) {
      return { isValid: false, error: `${fieldName} не может быть в будущем` };
    }

    if (notPast && dateObj < now) {
      return { isValid: false, error: `${fieldName} не может быть в прошлом` };
    }

    return { isValid: true, error: null };
  },

  /**
   * Проверка длины строки
   * @param {string} value
   * @param {Object} options - {min, max, fieldName}
   * @returns {{isValid: boolean, error: string}}
   */
  length(value, options = {}) {
    const { min, max, fieldName = 'Поле' } = options;

    if (!value) {
      value = '';
    }

    const length = value.length;

    if (min !== undefined && length < min) {
      return { isValid: false, error: `${fieldName} должно содержать минимум ${min} символов` };
    }

    if (max !== undefined && length > max) {
      return { isValid: false, error: `${fieldName} должно содержать максимум ${max} символов` };
    }

    return { isValid: true, error: null };
  },

  /**
   * Проверка ФИО (минимум 2 слова)
   * @param {string} fullName
   * @returns {{isValid: boolean, error: string}}
   */
  fullName(fullName) {
    if (!fullName || fullName.trim() === '') {
      return { isValid: false, error: 'ФИО обязательно' };
    }

    const words = fullName.trim().split(/\s+/);
    
    if (words.length < 2) {
      return { isValid: false, error: 'Введите минимум имя и фамилию' };
    }

    return { isValid: true, error: null };
  },

  /**
   * Комплексная валидация объекта
   * @param {Object} data - Данные для проверки
   * @param {Object} rules - Правила валидации
   * @returns {{isValid: boolean, errors: Object}}
   */
  validate(data, rules) {
    const errors = {};
    let isValid = true;

    Object.keys(rules).forEach(field => {
      const fieldRules = rules[field];
      const value = data[field];

      fieldRules.forEach(rule => {
        const result = rule(value);
        if (!result.isValid) {
          errors[field] = result.error;
          isValid = false;
        }
      });
    });

    return { isValid, errors };
  }
};

export default validators;

