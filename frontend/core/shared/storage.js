/**
 * Storage - Абстракция для работы с LocalStorage
 * Централизованное управление данными приложения
 */

class Storage {
  constructor() {
    this.prefix = 'mentor_system_';
  }

  /**
   * Получить данные по ключу
   * @param {string} key - Ключ
   * @returns {any} Данные или null
   */
  get(key) {
    try {
      const data = localStorage.getItem(this.prefix + key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`[Storage] Error getting ${key}:`, error);
      return null;
    }
  }

  /**
   * Сохранить данные
   * @param {string} key - Ключ
   * @param {any} value - Значение для сохранения
   * @returns {boolean} Успешно ли сохранено
   */
  set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('[Storage] LocalStorage quota exceeded!');
        this.showQuotaError();
      } else {
        console.error(`[Storage] Error setting ${key}:`, error);
      }
      return false;
    }
  }

  /**
   * Удалить данные по ключу
   * @param {string} key - Ключ
   */
  remove(key) {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error(`[Storage] Error removing ${key}:`, error);
    }
  }

  /**
   * Очистить все данные приложения
   */
  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('[Storage] Error clearing storage:', error);
    }
  }

  /**
   * Проверить существование ключа
   * @param {string} key - Ключ
   * @returns {boolean}
   */
  has(key) {
    return localStorage.getItem(this.prefix + key) !== null;
  }

  /**
   * Получить все ключи приложения
   * @returns {string[]}
   */
  keys() {
    const keys = Object.keys(localStorage);
    return keys
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.replace(this.prefix, ''));
  }

  /**
   * Получить размер использованного хранилища (примерно)
   * @returns {number} Размер в байтах
   */
  getSize() {
    let size = 0;
    for (let key in localStorage) {
      if (key.startsWith(this.prefix)) {
        size += localStorage[key].length + key.length;
      }
    }
    return size;
  }

  /**
   * Получить процент заполнения (примерно, лимит ~5MB)
   * @returns {number} Процент от 0 до 100
   */
  getUsagePercent() {
    const size = this.getSize();
    const limit = 5 * 1024 * 1024; // 5MB примерный лимит
    return Math.round((size / limit) * 100);
  }

  /**
   * Показать предупреждение о переполнении
   */
  showQuotaError() {
    alert(
      'Хранилище браузера заполнено!\n\n' +
      'Пожалуйста:\n' +
      '1. Экспортируйте данные (Настройки → Экспорт)\n' +
      '2. Очистите старые данные\n' +
      '3. Удалите ненужные записи'
    );
  }

  /**
   * Экспортировать все данные
   * @returns {Object}
   */
  exportAll() {
    const data = {};
    const keys = this.keys();
    
    keys.forEach(key => {
      data[key] = this.get(key);
    });

    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      data
    };
  }

  /**
   * Импортировать данные
   * @param {Object} exportData - Данные для импорта
   * @returns {boolean}
   */
  importAll(exportData) {
    try {
      if (!exportData.data) {
        throw new Error('Invalid export data format');
      }

      const keys = Object.keys(exportData.data);
      keys.forEach(key => {
        this.set(key, exportData.data[key]);
      });

      console.log(`[Storage] Imported ${keys.length} keys`);
      return true;
    } catch (error) {
      console.error('[Storage] Error importing data:', error);
      return false;
    }
  }
}

// Создаем глобальный экземпляр Storage
const storage = new Storage();

export default storage;

