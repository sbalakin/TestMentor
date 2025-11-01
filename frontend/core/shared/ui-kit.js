/**
 * UI Kit - Переиспользуемые UI компоненты
 */

const UIKit = {
  /**
   * Показать Toast уведомление
   * @param {string} message - Текст сообщения
   * @param {string} type - Тип: success, error, warning, info
   * @param {number} duration - Длительность в мс
   */
  showToast(message, type = 'info', duration = 3000) {
    // Создаем контейнер для toast'ов если его нет
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    // Создаем toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Иконка в зависимости от типа
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    toast.innerHTML = `
      <div class="toast-icon">${icons[type]}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close">✕</button>
    `;

    // Добавляем в контейнер
    container.appendChild(toast);

    // Анимация появления
    setTimeout(() => toast.classList.add('toast-show'), 10);

    // Обработчик закрытия
    const closeBtn = toast.querySelector('.toast-close');
    const closeToast = () => {
      toast.classList.remove('toast-show');
      setTimeout(() => toast.remove(), 300);
    };

    closeBtn.addEventListener('click', closeToast);

    // Автоматическое закрытие
    if (duration > 0) {
      setTimeout(closeToast, duration);
    }
  },

  /**
   * Показать модальное окно подтверждения
   * @param {string} title - Заголовок
   * @param {string} message - Сообщение
   * @param {string} confirmText - Текст кнопки подтверждения
   * @param {string} cancelText - Текст кнопки отмены
   * @returns {Promise<boolean>} - true если подтверждено
   */
  async confirm(title, message, confirmText = 'Да', cancelText = 'Отмена') {
    return new Promise((resolve) => {
      // Создаем модальное окно
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>${title}</h3>
          </div>
          <div class="modal-body">
            <p>${message}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-action="cancel">${cancelText}</button>
            <button class="btn btn-primary" data-action="confirm">${confirmText}</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Показываем модальное окно
      setTimeout(() => modal.classList.add('modal-show'), 10);

      // Обработчики
      const closeModal = (result) => {
        modal.classList.remove('modal-show');
        setTimeout(() => {
          modal.remove();
          resolve(result);
        }, 300);
      };

      modal.querySelector('[data-action="cancel"]').addEventListener('click', () => closeModal(false));
      modal.querySelector('[data-action="confirm"]').addEventListener('click', () => closeModal(true));
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(false);
      });
    });
  },

  /**
   * Показать индикатор загрузки
   * @param {string} message - Текст сообщения
   * @returns {Object} - Объект с методом close()
   */
  showLoading(message = 'Загрузка...') {
    const loader = document.createElement('div');
    loader.className = 'loader-overlay';
    loader.innerHTML = `
      <div class="loader-dialog">
        <div class="loader-spinner"></div>
        <div class="loader-message">${message}</div>
      </div>
    `;

    document.body.appendChild(loader);
    setTimeout(() => loader.classList.add('loader-show'), 10);

    return {
      close() {
        loader.classList.remove('loader-show');
        setTimeout(() => loader.remove(), 300);
      },
      updateMessage(newMessage) {
        loader.querySelector('.loader-message').textContent = newMessage;
      }
    };
  },

  /**
   * Создать Badge (бейдж)
   * @param {string} text - Текст
   * @param {string} type - Тип: success, danger, warning, info
   * @returns {string} HTML
   */
  badge(text, type = 'info') {
    const typeClass = `badge-${type}`;
    return `<span class="badge ${typeClass}">${text}</span>`;
  },

  /**
   * Создать Alert (предупреждение)
   * @param {string} message - Сообщение
   * @param {string} type - Тип: success, error, warning, info
   * @returns {string} HTML
   */
  alert(message, type = 'info') {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    return `
      <div class="alert alert-${type}">
        <div class="alert-icon">${icons[type]}</div>
        <div class="alert-message">${message}</div>
      </div>
    `;
  }
};

export default UIKit;

