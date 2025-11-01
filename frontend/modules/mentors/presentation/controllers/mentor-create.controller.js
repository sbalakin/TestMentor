/**
 * Mentor Create Controller
 * Контроллер страницы создания ментора
 */

import CreateMentorUseCase from '../../application/use-cases/create-mentor.use-case.js';

export class MentorCreateController {
  constructor() {
    this.createUseCase = new CreateMentorUseCase();
    this.form = null;
  }

  /**
   * Инициализация контроллера
   */
  init() {
    this.form = document.getElementById('createMentorForm');
    if (!this.form) {
      console.error('[MentorCreateController] Form not found');
      return;
    }

    this.setupEventListeners();
    this.setDefaultDate();
  }

  /**
   * Настройка обработчиков событий
   */
  setupEventListeners() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Валидация в реальном времени
    const inputs = this.form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  /**
   * Установить текущую дату по умолчанию
   */
  setDefaultDate() {
    const startDateInput = document.getElementById('startDate');
    if (startDateInput && !startDateInput.value) {
      startDateInput.value = new Date().toISOString().split('T')[0];
    }
  }

  /**
   * Обработка отправки формы
   */
  async handleSubmit(e) {
    e.preventDefault();

    // Очищаем предыдущие ошибки
    this.clearAllErrors();

    // Собираем данные формы
    const formData = new FormData(this.form);
    const data = {
      fullName: formData.get('fullName').trim(),
      email: formData.get('email').trim(),
      phone: formData.get('phone').trim(),
      specialization: formData.get('specialization'),
      hourlyRate: parseFloat(formData.get('hourlyRate')),
      startDate: formData.get('startDate'),
      status: formData.get('status'),
      passportOrInn: formData.get('passportOrInn').trim(),
      bankDetails: formData.get('bankDetails').trim(),
      notes: formData.get('notes').trim()
    };

    // Показываем индикатор загрузки
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Сохранение...';
    saveBtn.disabled = true;

    try {
      // Создаем ментора
      const mentor = await this.createUseCase.execute(data);

      // Показываем успех
      this.showSuccess('Ментор успешно создан!');

      // Перенаправляем на главную через 1 секунду
      setTimeout(() => {
        window.location.href = '../../../../index.html';
      }, 1000);

    } catch (error) {
      console.error('[MentorCreateController] Error:', error);
      
      // Показываем ошибки
      if (error.message.includes(',')) {
        // Множественные ошибки
        this.showError(error.message);
      } else {
        this.showError(error.message);
      }

      // Восстанавливаем кнопку
      saveBtn.textContent = originalText;
      saveBtn.disabled = false;
    }
  }

  /**
   * Валидация поля
   */
  validateField(input) {
    const value = input.value.trim();
    const name = input.name;
    let error = null;

    // Здесь можно добавить специфичную валидацию для каждого поля
    if (input.hasAttribute('required') && !value) {
      error = 'Это поле обязательно';
    }

    if (error) {
      this.showFieldError(name, error);
      return false;
    }

    return true;
  }

  /**
   * Показать ошибку поля
   */
  showFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    const inputElement = document.getElementById(fieldName) || 
                        document.querySelector(`[name="${fieldName}"]`);

    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }

    if (inputElement) {
      inputElement.classList.add('error');
    }
  }

  /**
   * Очистить ошибку поля
   */
  clearFieldError(input) {
    const name = input.name;
    const errorElement = document.getElementById(`${name}Error`);

    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }

    input.classList.remove('error');
  }

  /**
   * Очистить все ошибки
   */
  clearAllErrors() {
    const errorElements = this.form.querySelectorAll('.form-error');
    errorElements.forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });

    const inputs = this.form.querySelectorAll('.error');
    inputs.forEach(input => input.classList.remove('error'));
  }

  /**
   * Показать сообщение об успехе
   */
  showSuccess(message) {
    // TODO: Заменить на красивое уведомление
    alert(message);
  }

  /**
   * Показать ошибку
   */
  showError(message) {
    // TODO: Заменить на красивое уведомление
    alert('Ошибка: ' + message);
  }
}

