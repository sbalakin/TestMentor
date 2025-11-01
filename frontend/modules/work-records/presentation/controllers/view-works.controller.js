/**
 * View Works Controller
 * Контроллер страницы просмотра всех записей о работе
 */

import GetWorkRecordsUseCase from '../../application/use-cases/get-work-records.use-case.js';
import GetMentorsUseCase from '../../../mentors/application/use-cases/get-mentors.use-case.js';
import eventBus from '../../../../core/events/event-bus.js';
import formatters from '../../../../core/shared/formatters.js';

export class ViewWorksController {
  constructor() {
    this.getWorkRecordsUseCase = new GetWorkRecordsUseCase();
    this.getMentorsUseCase = new GetMentorsUseCase();
    this.workRecords = [];
    this.mentors = [];
    this.currentFilters = {};
  }

  /**
   * Инициализация
   */
  async init() {
    await this.loadData();
    this.setupEventListeners();
    this.subscribeToEvents();
    this.renderFilters();
    this.renderTable();
  }

  /**
   * Загрузка данных
   */
  async loadData() {
    try {
      [this.workRecords, this.mentors] = await Promise.all([
        this.getWorkRecordsUseCase.execute(),
        this.getMentorsUseCase.execute()
      ]);
    } catch (error) {
      console.error('[ViewWorksController] Error loading data:', error);
      alert('Ошибка загрузки данных');
    }
  }

  /**
   * Настройка обработчиков
   */
  setupEventListeners() {
    // Кнопки добавления
    const addWorkBtn = document.getElementById('addWorkBtn');
    const addFirstWorkBtn = document.getElementById('addFirstWorkBtn');

    if (addWorkBtn) {
      addWorkBtn.addEventListener('click', () => {
        window.location.href = './add-work.html';
      });
    }

    if (addFirstWorkBtn) {
      addFirstWorkBtn.addEventListener('click', () => {
        window.location.href = './add-work.html';
      });
    }

    // Фильтры
    const mentorFilter = document.getElementById('mentorFilter');
    const monthFilter = document.getElementById('monthFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');

    if (mentorFilter) {
      mentorFilter.addEventListener('change', () => {
        this.currentFilters.mentorId = mentorFilter.value;
        this.applyFilters();
      });
    }

    if (monthFilter) {
      monthFilter.addEventListener('change', () => {
        const value = monthFilter.value;
        if (value) {
          const [year, month] = value.split('-');
          this.currentFilters.year = parseInt(year);
          this.currentFilters.month = parseInt(month);
        } else {
          delete this.currentFilters.year;
          delete this.currentFilters.month;
        }
        this.applyFilters();
      });
    }

    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => {
        this.currentFilters.category = categoryFilter.value;
        this.applyFilters();
      });
    }

    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => this.resetFilters());
    }
  }

  /**
   * Подписка на события
   */
  subscribeToEvents() {
    eventBus.subscribe('work:added', () => {
      this.loadData().then(() => this.applyFilters());
    });

    eventBus.subscribe('work:updated', () => {
      this.loadData().then(() => this.applyFilters());
    });

    eventBus.subscribe('work:deleted', () => {
      this.loadData().then(() => this.applyFilters());
    });
  }

  /**
   * Отрисовка фильтров
   */
  renderFilters() {
    // Фильтр менторов
    const mentorFilter = document.getElementById('mentorFilter');
    if (mentorFilter) {
      mentorFilter.innerHTML = '<option value="">Все менторы</option>';
      this.mentors.forEach(mentor => {
        const option = document.createElement('option');
        option.value = mentor.id;
        option.textContent = mentor.fullName;
        mentorFilter.appendChild(option);
      });
    }

    // Фильтр месяцев (последние 12 месяцев)
    const monthFilter = document.getElementById('monthFilter');
    if (monthFilter) {
      monthFilter.innerHTML = '<option value="">Все месяцы</option>';
      const months = this.generateMonthsOptions();
      months.forEach(({ value, label }) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        monthFilter.appendChild(option);
      });
    }
  }

  /**
   * Генерация опций месяцев
   */
  generateMonthsOptions() {
    const months = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      months.push({
        value: `${year}-${month}`,
        label: date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
      });
    }
    
    return months;
  }

  /**
   * Применить фильтры
   */
  async applyFilters() {
    try {
      const filteredRecords = await this.getWorkRecordsUseCase.execute(this.currentFilters);
      this.renderTable(filteredRecords);
    } catch (error) {
      console.error('[ViewWorksController] Error applying filters:', error);
    }
  }

  /**
   * Сбросить фильтры
   */
  resetFilters() {
    this.currentFilters = {};
    
    document.getElementById('mentorFilter').value = '';
    document.getElementById('monthFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    
    this.renderTable();
  }

  /**
   * Отрисовка таблицы
   */
  renderTable(records = null) {
    const tbody = document.getElementById('worksTableBody');
    if (!tbody) return;

    const displayRecords = records || this.workRecords;

    // Обновляем сводку
    this.updateSummary(displayRecords);

    // Очищаем таблицу
    tbody.innerHTML = '';

    if (displayRecords.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="empty-state">
            <div class="empty-state-content">
              <div class="empty-state-icon">📝</div>
              <h3>Нет записей</h3>
              <p>Добавьте первую запись о работе</p>
              <button class="btn btn-primary" id="addFirstWorkBtn">
                Добавить запись
              </button>
            </div>
          </td>
        </tr>
      `;

      // Переустанавливаем обработчик
      setTimeout(() => {
        const btn = document.getElementById('addFirstWorkBtn');
        if (btn) {
          btn.addEventListener('click', () => {
            window.location.href = './add-work.html';
          });
        }
      }, 0);

      return;
    }

    // Отрисовываем записи
    displayRecords.forEach((record, index) => {
      const mentor = this.mentors.find(m => m.id === record.mentorId);
      const mentorName = mentor ? mentor.fullName : 'Неизвестный ментор';
      const amount = mentor ? mentor.hourlyRate * record.hours : 0;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${formatters.date(record.date)}</td>
        <td>${mentorName}</td>
        <td>${this.getCategoryName(record.category)}</td>
        <td>${formatters.truncate(record.description, 50)}</td>
        <td>${formatters.hours(record.hours)}</td>
        <td>${formatters.money(amount)}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-icon" title="Просмотр" data-action="view" data-id="${record.id}">
              👁️
            </button>
            <button class="btn-icon" title="Редактировать" data-action="edit" data-id="${record.id}">
              ✏️
            </button>
            <button class="btn-icon" title="Удалить" data-action="delete" data-id="${record.id}">
              🗑️
            </button>
          </div>
        </td>
      `;

      tbody.appendChild(row);
    });

    // Обработчики для кнопок действий
    this.setupActionButtons();
  }

  /**
   * Обновление сводки
   */
  updateSummary(records) {
    const totalRecords = records.length;
    const totalHours = records.reduce((sum, r) => sum + r.hours, 0);
    
    let totalAmount = 0;
    records.forEach(record => {
      const mentor = this.mentors.find(m => m.id === record.mentorId);
      if (mentor) {
        totalAmount += mentor.hourlyRate * record.hours;
      }
    });

    document.getElementById('totalRecords').textContent = totalRecords;
    document.getElementById('totalHours').textContent = formatters.hours(totalHours);
    document.getElementById('totalAmount').textContent = formatters.money(totalAmount);
  }

  /**
   * Получить название категории
   */
  getCategoryName(category) {
    const categories = {
      'mentoring': 'Обучение/Менторство',
      'development': 'Разработка',
      'consulting': 'Консультации',
      'other': 'Другое'
    };
    return categories[category] || category;
  }

  /**
   * Настройка кнопок действий
   */
  setupActionButtons() {
    const actionButtons = document.querySelectorAll('.btn-icon');
    actionButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        const id = e.target.dataset.id;
        this.handleAction(action, id);
      });
    });
  }

  /**
   * Обработка действий
   */
  handleAction(action, recordId) {
    switch (action) {
      case 'view':
        alert('Функция просмотра будет реализована позже');
        break;
      case 'edit':
        alert('Функция редактирования будет реализована позже');
        break;
      case 'delete':
        this.handleDelete(recordId);
        break;
    }
  }

  /**
   * Обработка удаления
   */
  async handleDelete(recordId) {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) {
      return;
    }

    try {
      // TODO: Создать DeleteWorkRecordUseCase
      alert('Функция удаления будет реализована позже');
    } catch (error) {
      console.error('[ViewWorksController] Error deleting record:', error);
      alert('Ошибка при удалении записи');
    }
  }
}

