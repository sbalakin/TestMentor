/**
 * Dashboard Controller
 * Контроллер главной страницы (дашборда)
 */

import GetMentorsUseCase from '../../../mentors/application/use-cases/get-mentors.use-case.js';
import eventBus from '../../../../core/events/event-bus.js';
import formatters from '../../../../core/shared/formatters.js';

export class DashboardController {
  constructor() {
    this.getMentorsUseCase = new GetMentorsUseCase();
    this.currentFilter = 'all';
    this.searchQuery = '';
  }

  /**
   * Инициализация
   */
  init() {
    this.setupEventListeners();
    this.loadData();
    this.subscribeToEvents();
  }

  /**
   * Настройка обработчиков
   */
  setupEventListeners() {
    // Кнопки добавления ментора
    const addMentorBtn = document.getElementById('addMentorBtn');
    const addFirstMentorBtn = document.getElementById('addFirstMentorBtn');
    
    if (addMentorBtn) {
      addMentorBtn.addEventListener('click', () => this.navigateToCreateMentor());
    }
    
    if (addFirstMentorBtn) {
      addFirstMentorBtn.addEventListener('click', () => this.navigateToCreateMentor());
    }

    // Кнопка добавления работы
    const addWorkBtn = document.getElementById('addWorkBtn');
    if (addWorkBtn) {
      addWorkBtn.addEventListener('click', () => {
        window.location.href = './modules/work-records/presentation/pages/add-work.html';
      });
    }

    // Поиск
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.loadMentors();
      });
    }

    // Фильтры
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.loadMentors();
      });
    });
  }

  /**
   * Подписка на события
   */
  subscribeToEvents() {
    eventBus.subscribe('mentor:created', () => this.loadData());
    eventBus.subscribe('mentor:updated', () => this.loadData());
    eventBus.subscribe('mentor:deleted', () => this.loadData());
  }

  /**
   * Загрузка всех данных
   */
  async loadData() {
    await Promise.all([
      this.loadStatistics(),
      this.loadMentors()
    ]);
  }

  /**
   * Загрузка статистики
   */
  async loadStatistics() {
    try {
      const mentors = await this.getMentorsUseCase.execute();
      const activeMentors = mentors.filter(m => m.status === 'active');

      // TODO: Получить реальные данные по работам
      const monthHours = 0;
      const monthAmount = 0;

      // Обновляем UI
      document.getElementById('totalMentors').textContent = mentors.length;
      document.getElementById('activeMentors').textContent = activeMentors.length;
      document.getElementById('monthHours').textContent = monthHours;
      document.getElementById('monthAmount').textContent = formatters.money(monthAmount);

    } catch (error) {
      console.error('[DashboardController] Error loading statistics:', error);
    }
  }

  /**
   * Загрузка менторов
   */
  async loadMentors() {
    try {
      // Фильтры
      const filters = {
        search: this.searchQuery
      };

      if (this.currentFilter !== 'all') {
        filters.status = this.currentFilter;
      }

      const mentors = await this.getMentorsUseCase.execute(filters);

      this.renderMentors(mentors);

    } catch (error) {
      console.error('[DashboardController] Error loading mentors:', error);
    }
  }

  /**
   * Отрисовка списка менторов
   */
  renderMentors(mentors) {
    const tbody = document.getElementById('mentorsTableBody');
    if (!tbody) return;

    // Очищаем таблицу
    tbody.innerHTML = '';

    if (mentors.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="empty-state">
            <div class="empty-state-content">
              <div class="empty-state-icon">📋</div>
              <h3>Нет менторов</h3>
              <p>Добавьте первого ментора для начала работы</p>
              <button class="btn btn-primary" id="addFirstMentorBtn">
                Добавить ментора
              </button>
            </div>
          </td>
        </tr>
      `;
      
      // Переустанавливаем обработчик для новой кнопки
      setTimeout(() => {
        const btn = document.getElementById('addFirstMentorBtn');
        if (btn) {
          btn.addEventListener('click', () => this.navigateToCreateMentor());
        }
      }, 0);
      
      return;
    }

    // Отрисовываем менторов
    mentors.forEach((mentor, index) => {
      const row = document.createElement('tr');
      
      const statusBadge = mentor.isActive() 
        ? '<span class="badge badge-success">Активный</span>'
        : '<span class="badge badge-danger">Неактивный</span>';

      // TODO: Получить реальные данные по работам
      const monthHours = 0;
      const monthAmount = 0;

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>
          <div class="mentor-cell">
            <div class="mentor-avatar">${mentor.getInitials()}</div>
            <span>${mentor.fullName}</span>
          </div>
        </td>
        <td>${mentor.specialization}</td>
        <td>${formatters.money(mentor.hourlyRate)}</td>
        <td>${monthHours} ч</td>
        <td>${formatters.money(monthAmount)}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-icon" title="Просмотр" data-action="view" data-id="${mentor.id}">
              👁️
            </button>
            <button class="btn-icon" title="Редактировать" data-action="edit" data-id="${mentor.id}">
              ✏️
            </button>
            <button class="btn-icon" title="Удалить" data-action="delete" data-id="${mentor.id}">
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
   * Настройка кнопок действий в таблице
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
  handleAction(action, mentorId) {
    switch (action) {
      case 'view':
        window.location.href = `./modules/mentors/presentation/pages/view-mentor.html?id=${mentorId}`;
        break;
      case 'edit':
        // Пока редактирование через просмотр профиля
        alert('Редактирование будет добавлено в следующей версии. Пока можно удалить и создать заново.');
        break;
      case 'delete':
        this.handleDelete(mentorId);
        break;
    }
  }

  /**
   * Обработка удаления
   */
  async handleDelete(mentorId) {
    if (!confirm('Вы уверены, что хотите удалить этого ментора? Это действие необратимо!')) {
      return;
    }

    try {
      // Используем API напрямую для удаления
      const api = (await import('../../../../core/shared/api.js')).default;
      await api.delete(`/mentors/${mentorId}`);
      
      alert('Ментор успешно удален');
      
      // Перезагружаем данные
      this.loadData();
      
      // Публикуем событие
      eventBus.publish('mentor:deleted', { mentorId });
      
    } catch (error) {
      console.error('[DashboardController] Error deleting mentor:', error);
      alert('Ошибка при удалении ментора: ' + error.message);
    }
  }

  /**
   * Переход на страницу создания ментора
   */
  navigateToCreateMentor() {
    window.location.href = './modules/mentors/presentation/pages/create-mentor.html';
  }
}

