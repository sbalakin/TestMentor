/**
 * Work Record Entity - Сущность записи о работе
 * Содержит бизнес-логику работы с записью о выполненной работе
 */

class WorkRecordEntity {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.mentorId = data.mentorId;
    this.date = data.date || new Date().toISOString().split('T')[0];
    this.hours = data.hours || 0;
    this.description = data.description || '';
    this.category = data.category || 'other'; // mentoring, development, consulting, other
    this.status = data.status || 'completed'; // completed, pending, approved
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  /**
   * Генерация уникального ID
   */
  generateId() {
    return `work_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Обновить запись
   */
  update(data) {
    const allowedFields = [
      'date', 'hours', 'description', 'category', 'status', 'notes'
    ];

    allowedFields.forEach(field => {
      if (data.hasOwnProperty(field)) {
        this[field] = data[field];
      }
    });

    this.updatedAt = new Date().toISOString();
  }

  /**
   * Отметить как завершенную
   */
  markAsCompleted() {
    this.status = 'completed';
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Отметить как одобренную
   */
  approve() {
    this.status = 'approved';
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Проверка завершенности
   */
  isCompleted() {
    return this.status === 'completed';
  }

  /**
   * Проверка одобрения
   */
  isApproved() {
    return this.status === 'approved';
  }

  /**
   * Получить месяц и год записи
   */
  getMonthYear() {
    const date = new Date(this.date);
    return {
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      formatted: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    };
  }

  /**
   * Валидация сущности
   */
  validate() {
    const errors = [];

    if (!this.mentorId) {
      errors.push('Ментор обязателен');
    }

    if (!this.date) {
      errors.push('Дата обязательна');
    }

    if (!this.hours || this.hours <= 0) {
      errors.push('Количество часов должно быть больше 0');
    }

    if (this.hours > 24) {
      errors.push('Количество часов не может превышать 24 в день');
    }

    if (!this.description || this.description.trim() === '') {
      errors.push('Описание работы обязательно');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Преобразовать в простой объект
   */
  toJSON() {
    return {
      id: this.id,
      mentorId: this.mentorId,
      date: this.date,
      hours: this.hours,
      description: this.description,
      category: this.category,
      status: this.status,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Создать из простого объекта
   */
  static fromJSON(json) {
    return new WorkRecordEntity(json);
  }
}

export default WorkRecordEntity;

