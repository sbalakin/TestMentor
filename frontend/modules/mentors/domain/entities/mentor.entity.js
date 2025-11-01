/**
 * Mentor Entity - Сущность ментора
 * Содержит бизнес-логику работы с ментором
 */

class MentorEntity {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.fullName = data.fullName || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.photoUrl = data.photoUrl || null;
    this.specialization = data.specialization || '';
    this.hourlyRate = data.hourlyRate || 0;
    this.startDate = data.startDate || new Date().toISOString().split('T')[0];
    this.status = data.status || 'active'; // active, inactive
    this.passportOrInn = data.passportOrInn || '';
    this.bankDetails = data.bankDetails || '';
    this.notes = data.notes || '';
    this.tags = data.tags || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  /**
   * Генерация уникального ID
   */
  generateId() {
    return `mentor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Проверка активности ментора
   */
  isActive() {
    return this.status === 'active';
  }

  /**
   * Активировать ментора
   */
  activate() {
    this.status = 'active';
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Деактивировать ментора
   */
  deactivate() {
    this.status = 'inactive';
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Обновить данные ментора
   */
  update(data) {
    const allowedFields = [
      'fullName', 'email', 'phone', 'photoUrl', 'specialization',
      'hourlyRate', 'startDate', 'status', 'passportOrInn',
      'bankDetails', 'notes', 'tags'
    ];

    allowedFields.forEach(field => {
      if (data.hasOwnProperty(field)) {
        this[field] = data[field];
      }
    });

    this.updatedAt = new Date().toISOString();
  }

  /**
   * Получить инициалы
   */
  getInitials() {
    const words = this.fullName.trim().split(/\s+/);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
  }

  /**
   * Преобразовать в простой объект для хранения
   */
  toJSON() {
    return {
      id: this.id,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      photoUrl: this.photoUrl,
      specialization: this.specialization,
      hourlyRate: this.hourlyRate,
      startDate: this.startDate,
      status: this.status,
      passportOrInn: this.passportOrInn,
      bankDetails: this.bankDetails,
      notes: this.notes,
      tags: this.tags,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Создать из простого объекта
   */
  static fromJSON(json) {
    return new MentorEntity(json);
  }

  /**
   * Валидация сущности
   */
  validate() {
    const errors = [];

    if (!this.fullName || this.fullName.trim() === '') {
      errors.push('ФИО обязательно');
    }

    if (!this.email || this.email.trim() === '') {
      errors.push('Email обязателен');
    }

    if (!this.specialization || this.specialization.trim() === '') {
      errors.push('Специализация обязательна');
    }

    if (!this.hourlyRate || this.hourlyRate <= 0) {
      errors.push('Ставка должна быть больше 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default MentorEntity;

