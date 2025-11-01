/**
 * Formatters - Форматирование данных для отображения
 */

const formatters = {
  /**
   * Форматировать число как денежную сумму
   * @param {number} amount - Сумма
   * @param {string} currency - Валюта
   * @returns {string}
   */
  money(amount, currency = 'руб.') {
    if (amount === null || amount === undefined) {
      return '0 ' + currency;
    }

    const formatted = new Intl.NumberFormat('ru-RU').format(amount);
    return `${formatted} ${currency}`;
  },

  /**
   * Форматировать дату в dd.mm.yyyy
   * @param {string|Date} date
   * @returns {string}
   */
  date(date) {
    if (!date) return '-';

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '-';

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    return `${day}.${month}.${year}`;
  },

  /**
   * Форматировать дату и время
   * @param {string|Date} date
   * @returns {string}
   */
  datetime(date) {
    if (!date) return '-';

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '-';

    return dateObj.toLocaleString('ru-RU');
  },

  /**
   * Форматировать телефон
   * @param {string} phone
   * @returns {string}
   */
  phone(phone) {
    if (!phone) return '-';

    // Убираем все символы кроме цифр
    const cleaned = phone.replace(/\D/g, '');

    // Форматируем как +7 (999) 999-99-99
    if (cleaned.length === 11) {
      return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
    }

    return phone;
  },

  /**
   * Форматировать часы
   * @param {number} hours
   * @returns {string}
   */
  hours(hours) {
    if (hours === null || hours === undefined) return '0 ч';

    const hourWord = this.pluralize(hours, ['час', 'часа', 'часов']);
    return `${hours} ${hourWord}`;
  },

  /**
   * Склонение слов по числу
   * @param {number} number - Число
   * @param {string[]} forms - Формы слова [1, 2, 5]
   * @returns {string}
   */
  pluralize(number, forms) {
    const absNumber = Math.abs(number) % 100;
    const num = absNumber % 10;

    if (absNumber > 10 && absNumber < 20) {
      return forms[2];
    }

    if (num > 1 && num < 5) {
      return forms[1];
    }

    if (num === 1) {
      return forms[0];
    }

    return forms[2];
  },

  /**
   * Сократить текст до N символов
   * @param {string} text
   * @param {number} maxLength
   * @returns {string}
   */
  truncate(text, maxLength = 50) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  /**
   * Капитализировать первую букву
   * @param {string} text
   * @returns {string}
   */
  capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  },

  /**
   * Форматировать ФИО (капитализация каждого слова)
   * @param {string} fullName
   * @returns {string}
   */
  fullName(fullName) {
    if (!fullName) return '';
    
    return fullName
      .split(' ')
      .map(word => this.capitalize(word.toLowerCase()))
      .join(' ');
  },

  /**
   * Получить инициалы из ФИО
   * @param {string} fullName
   * @returns {string}
   */
  initials(fullName) {
    if (!fullName) return '';

    const words = fullName.trim().split(/\s+/);
    if (words.length === 0) return '';

    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
  },

  /**
   * Форматировать процент
   * @param {number} value
   * @param {number} total
   * @returns {string}
   */
  percent(value, total) {
    if (!total || total === 0) return '0%';
    const percent = Math.round((value / total) * 100);
    return `${percent}%`;
  }
};

export default formatters;

