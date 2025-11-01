/**
 * Add Work Record Use Case
 * Сценарий добавления записи о выполненной работе
 */

import WorkRecordEntity from '../../domain/entities/work-record.entity.js';
import WorkRecordRepository from '../../infrastructure/repositories/work-record.repository.impl.js';
import MentorRepository from '../../../mentors/infrastructure/repositories/mentor.repository.impl.js';
import eventBus from '../../../../core/events/event-bus.js';
import validators from '../../../../core/shared/validators.js';

class AddWorkRecordUseCase {
  constructor() {
    this.workRecordRepository = new WorkRecordRepository();
    this.mentorRepository = new MentorRepository();
  }

  /**
   * Выполнить добавление записи о работе
   * @param {Object} data - Данные записи
   * @returns {Promise<Object>} Созданная запись
   */
  async execute(data) {
    try {
      // 1. Валидация данных
      const validation = this.validate(data);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(', '));
      }

      // 2. Проверка существования ментора
      const mentor = await this.mentorRepository.findById(data.mentorId);
      if (!mentor) {
        throw new Error('Ментор не найден');
      }

      // 3. Создание сущности
      const workRecord = new WorkRecordEntity(data);

      // 4. Валидация сущности
      const entityValidation = workRecord.validate();
      if (!entityValidation.isValid) {
        throw new Error(entityValidation.errors.join(', '));
      }

      // 5. Сохранение
      const savedRecord = await this.workRecordRepository.save(workRecord);

      // 6. Публикация события
      eventBus.publish('work:added', {
        workRecordId: savedRecord.id,
        mentorId: savedRecord.mentorId,
        hours: savedRecord.hours,
        date: savedRecord.date
      });

      console.log('[AddWorkRecordUseCase] Work record added:', savedRecord.id);

      return savedRecord;

    } catch (error) {
      console.error('[AddWorkRecordUseCase] Error:', error);
      throw error;
    }
  }

  /**
   * Валидация входных данных
   */
  validate(data) {
    const errors = {};

    // Ментор
    const mentorValidation = validators.required(data.mentorId, 'Ментор');
    if (!mentorValidation.isValid) {
      errors.mentorId = mentorValidation.error;
    }

    // Дата
    const dateValidation = validators.date(data.date, {
      fieldName: 'Дата',
      allowFuture: false
    });
    if (!dateValidation.isValid) {
      errors.date = dateValidation.error;
    }

    // Часы
    const hoursValidation = validators.number(data.hours, {
      min: 0.1,
      max: 24,
      fieldName: 'Количество часов'
    });
    if (!hoursValidation.isValid) {
      errors.hours = hoursValidation.error;
    }

    // Описание
    const descriptionValidation = validators.required(data.description, 'Описание работы');
    if (!descriptionValidation.isValid) {
      errors.description = descriptionValidation.error;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export default AddWorkRecordUseCase;

