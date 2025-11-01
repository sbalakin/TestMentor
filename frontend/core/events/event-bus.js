/**
 * Event Bus - Шина событий для связи между модулями
 * Модули общаются через события, не зная друг о друге
 */

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Подписаться на событие
   * @param {string} eventType - Тип события (например: 'mentor:created')
   * @param {Function} callback - Функция-обработчик
   * @returns {Function} Функция для отписки
   */
  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    this.listeners.get(eventType).push(callback);

    // Возвращаем функцию для отписки
    return () => {
      const callbacks = this.listeners.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Опубликовать событие
   * @param {string} eventType - Тип события
   * @param {Object} payload - Данные события
   */
  publish(eventType, payload = {}) {
    const event = {
      type: eventType,
      payload,
      timestamp: new Date().toISOString()
    };

    console.log(`[EventBus] Publish: ${eventType}`, event);

    const callbacks = this.listeners.get(eventType);
    if (callbacks && callbacks.length > 0) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`[EventBus] Error in listener for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Отписаться от всех событий определенного типа
   * @param {string} eventType - Тип события
   */
  unsubscribeAll(eventType) {
    this.listeners.delete(eventType);
  }

  /**
   * Очистить все подписки
   */
  clear() {
    this.listeners.clear();
  }

  /**
   * Получить количество подписчиков на событие
   * @param {string} eventType - Тип события
   * @returns {number}
   */
  getListenerCount(eventType) {
    return this.listeners.get(eventType)?.length || 0;
  }
}

// Создаем глобальный экземпляр Event Bus
const eventBus = new EventBus();

// Экспортируем для использования в модулях
export default eventBus;

