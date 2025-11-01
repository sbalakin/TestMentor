/**
 * App - Главное приложение
 * Инициализация и управление модулями
 */

import eventBus from './events/event-bus.js';
import storage from './shared/storage.js';

class App {
  constructor() {
    this.modules = new Map();
    this.isInitialized = false;
  }

  /**
   * Регистрация модуля
   * @param {string} name - Название модуля
   * @param {Object} module - Модуль
   */
  registerModule(name, module) {
    if (this.modules.has(name)) {
      console.warn(`[App] Module ${name} already registered`);
      return;
    }

    this.modules.set(name, module);
    console.log(`[App] Module registered: ${name}`);
  }

  /**
   * Инициализация приложения
   */
  async init() {
    if (this.isInitialized) {
      console.warn('[App] Already initialized');
      return;
    }

    console.log('[App] Initializing...');

    try {
      // Проверяем доступность LocalStorage
      this.checkStorageAvailability();

      // Инициализируем модули
      for (const [name, module] of this.modules) {
        if (module.init && typeof module.init === 'function') {
          console.log(`[App] Initializing module: ${name}`);
          await module.init();
        }
      }

      this.isInitialized = true;
      console.log('[App] Initialization complete');

      // Публикуем событие о готовности приложения
      eventBus.publish('app:ready', {
        modules: Array.from(this.modules.keys())
      });

    } catch (error) {
      console.error('[App] Initialization error:', error);
      this.showError('Ошибка инициализации приложения');
    }
  }

  /**
   * Проверка доступности LocalStorage
   */
  checkStorageAvailability() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      
      // Проверяем заполненность
      const usagePercent = storage.getUsagePercent();
      if (usagePercent > 80) {
        console.warn(`[App] Storage usage: ${usagePercent}%`);
        this.showWarning(`Хранилище браузера заполнено на ${usagePercent}%`);
      }
    } catch (error) {
      throw new Error('LocalStorage недоступен. Пожалуйста, разрешите использование cookies и хранилища.');
    }
  }

  /**
   * Получить модуль по имени
   * @param {string} name
   * @returns {Object|null}
   */
  getModule(name) {
    return this.modules.get(name) || null;
  }

  /**
   * Показать ошибку пользователю
   * @param {string} message
   */
  showError(message) {
    // TODO: Заменить на красивое уведомление
    alert('Ошибка: ' + message);
  }

  /**
   * Показать предупреждение
   * @param {string} message
   */
  showWarning(message) {
    console.warn('[App]', message);
  }

  /**
   * Уничтожение приложения (для тестов)
   */
  destroy() {
    this.modules.clear();
    eventBus.clear();
    this.isInitialized = false;
  }
}

// Создаем глобальный экземпляр приложения
const app = new App();

// Делаем доступным глобально для отладки
window.app = app;
window.eventBus = eventBus;
window.storage = storage;

export default app;

