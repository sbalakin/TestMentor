/**
 * Add Work Controller
 * Контроллер страницы добавления записи о работе
 */

import AddWorkRecordUseCase from '../../application/use-cases/add-work-record.use-case.js';
import GetMentorsUseCase from '../../../mentors/application/use-cases/get-mentors.use-case.js';
import formatters from '../../../../core/shared/formatters.js';

export class AddWorkController {
  constructor() {
    this.addWorkUseCase = new AddWorkRecordUseCase();
    this.getMentorsUseCase = new GetMentorsUseCase();
    this.form = null;
    this.mentors = [];
    this.selectedMentor = null;
  }

  /**
   * Инициализация контроллера
   */
  async init() {
    this.form = document.getElementById('addWorkForm');
    if (!this.form) {
      console.error('[AddWorkController] Form not found');
      return;
    }

    await this.loadMentors();
    this.setupEventListeners();
    this.setDefaultDate();
  }

  /**
   * Загрузка списка менторов
   */
  async loadMentors() {
    try {
      // Получаем только активных менторов
      this.mentors = await this.getMentorsUseCase.execute({ status: 'active' });
      this.renderMentorSelect();
    } catch (error) {
      console.error('[AddWorkController] Error loading mentors:', error);
      alert('Ошибка загрузки списка менторов');
    }
  }

  /**
   * Отрисовка списка менторов в select
   */
  renderMentorSelect() {
    const select = document.getElementById('mentorId');
    if (!select) return;

    // Очищаем текущие опции, кроме первой
    select.innerHTML = '<option value="">Выберите ментора</option>';

    if (this.mentors.length === 0) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'Нет активных менторов';
      option.disabled = true;
      select.appendChild(option);
      return;
    }

    // Добавляем менторов
    this.mentors.forEach(mentor => {
      const option = document.createElement('option');
      option.value = mentor.id;
      option.textContent = `${mentor.fullName} (${formatters.money(mentor.hourlyRate)}/час)`;
      select.appendChild(option);
    });
  }

  /**
   * Настройка обработчиков событий
   */
  setupEventListeners() {
    // Отправка формы
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Выбор ментора
    const mentorSelect = document.getElementById('mentorId');
    mentorSelect.addEventListener('change', (e) => this.handleMentorChange(e));

    // Изменение часов
    const hoursInput = document.getElementById('hours');
    hoursInput.addEventListener('input', () => this.updateCalculation());

    // Валидация полей при потере фокуса
    const inputs = this.form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  /**
   * Обработка выбора ментора
   */
  handleMentorChange(e) {
    const mentorId = e.target.value;
    this.selectedMentor = this.mentors.find(m => m.id === mentorId);
    this.updateCalculation();
  }

  /**
   * Обновление расчета стоимости
   */
  updateCalculation() {
    const hoursInput = document.getElementById('hours');
    const hours = parseFloat(hoursInput.value) || 0;

    // Обновляем отображение ставки
    const mentorRateElement = document.getElementById('mentorRate');
    if (this.selectedMentor) {
      mentorRateElement.textContent = formatters.money(this.selectedMentor.hourlyRate) + '/час';
    } else {
      mentorRateElement.textContent = '-';
    }

    // Обновляем отображение часов
    const hoursDisplayElement = document.getElementById('hoursDisplay');
    hoursDisplayElement.textContent = hours > 0 ? formatters.hours(hours) : '-';

    // Расчет итоговой суммы
    const totalAmountElement = document.getElementById('totalAmount');
    if (this.selectedMentor && hours > 0) {
      const total = this.selectedMentor.hourlyRate * hours;
      totalAmountElement.textContent = formatters.money(total);
    } else {
      totalAmountElement.textContent = '0 руб.';
    }
  }

  /**
   * Установить текущую дату по умолчанию
   */
  setDefaultDate() {
    const dateInput = document.getElementById('date');
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
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
      mentorId: formData.get('mentorId'),
      date: formData.get('date'),
      hours: parseFloat(formData.get('hours')),
      description: formData.get('description').trim(),
      category: formData.get('category'),
      notes: formData.get('notes').trim(),
      status: 'completed'
    };

    // Показываем индикатор загрузки
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Сохранение...';
    saveBtn.disabled = true;

    try {
      // Добавляем запись
      const workRecord = await this.addWorkUseCase.execute(data);

      // Показываем успех
      this.showSuccess('Запись о работе успешно добавлена!');

      // Очищаем форму
      this.form.reset();
      this.selectedMentor = null;
      this.updateCalculation();
      this.setDefaultDate();

      // Можно также перенаправить на страницу со всеми записями
      // setTimeout(() => {
      //   window.location.href = './view-works.html';
      // }, 1000);

    } catch (error) {
      console.error('[AddWorkController] Error:', error);
      this.showError(error.message);
    } finally {
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

    if (input.hasAttribute('required') && !value) {
      error = 'Это поле обязательно';
    }

    if (name === 'hours' && value) {
      const hours = parseFloat(value);
      if (isNaN(hours) || hours <= 0) {
        error = 'Количество часов должно быть больше 0';
      }
      if (hours > 24) {
        error = 'Количество часов не может превышать 24';
      }
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

