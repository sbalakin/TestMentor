/**
 * Utils - Вспомогательные утилиты
 */

const Utils = {
  /**
   * Debounce функция
   * @param {Function} func - Функция для выполнения
   * @param {number} wait - Задержка в мс
   * @returns {Function}
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle функция
   * @param {Function} func - Функция для выполнения
   * @param {number} limit - Лимит в мс
   * @returns {Function}
   */
  throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Получить параметр из URL
   * @param {string} name - Название параметра
   * @returns {string|null}
   */
  getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  },

  /**
   * Установить параметр в URL (без перезагрузки)
   * @param {string} name - Название параметра
   * @param {string} value - Значение
   */
  setUrlParam(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.pushState({}, '', url);
  },

  /**
   * Скачать файл
   * @param {string} data - Данные файла
   * @param {string} filename - Имя файла
   * @param {string} type - MIME тип
   */
  downloadFile(data, filename, type = 'text/plain') {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Копировать текст в буфер обмена
   * @param {string} text - Текст для копирования
   * @returns {Promise<boolean>}
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      return false;
    }
  },

  /**
   * Генерировать UUID v4
   * @returns {string}
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  /**
   * Глубокое копирование объекта
   * @param {any} obj - Объект для копирования
   * @returns {any}
   */
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Проверка пустоты объекта
   * @param {Object} obj - Объект
   * @returns {boolean}
   */
  isEmpty(obj) {
    if (obj === null || obj === undefined) return true;
    if (typeof obj === 'string' || Array.isArray(obj)) {
      return obj.length === 0;
    }
    if (typeof obj === 'object') {
      return Object.keys(obj).length === 0;
    }
    return false;
  },

  /**
   * Задержка (для async/await)
   * @param {number} ms - Миллисекунды
   * @returns {Promise}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Получить текущую дату в формате YYYY-MM-DD
   * @returns {string}
   */
  getCurrentDate() {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * Получить первый и последний день месяца
   * @param {number} year - Год
   * @param {number} month - Месяц (1-12)
   * @returns {Object} - { start, end }
   */
  getMonthRange(year, month) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  },

  /**
   * Группировка массива по ключу
   * @param {Array} array - Массив объектов
   * @param {string} key - Ключ для группировки
   * @returns {Object}
   */
  groupBy(array, key) {
    return array.reduce((result, item) => {
      const groupKey = item[key];
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {});
  },

  /**
   * Сортировка массива объектов по ключу
   * @param {Array} array - Массив объектов
   * @param {string} key - Ключ для сортировки
   * @param {string} order - 'asc' или 'desc'
   * @returns {Array}
   */
  sortBy(array, key, order = 'asc') {
    return array.sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  },

  /**
   * Фильтрация массива по множественным условиям
   * @param {Array} array - Массив объектов
   * @param {Object} filters - Объект с фильтрами
   * @returns {Array}
   */
  filterBy(array, filters) {
    return array.filter(item => {
      return Object.keys(filters).every(key => {
        if (filters[key] === null || filters[key] === undefined || filters[key] === '') {
          return true;
        }
        
        if (typeof item[key] === 'string' && typeof filters[key] === 'string') {
          return item[key].toLowerCase().includes(filters[key].toLowerCase());
        }
        
        return item[key] === filters[key];
      });
    });
  }
};

export default Utils;

