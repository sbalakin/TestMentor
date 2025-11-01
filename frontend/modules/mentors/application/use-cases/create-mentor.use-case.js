/**
 * Create Mentor Use Case
 * Сценарий создания нового ментора
 */

import MentorEntity from '../../domain/entities/mentor.entity.js';
import MentorRepository from '../../infrastructure/repositories/mentor.repository.impl.js';
import eventBus from '../../../../core/events/event-bus.js';
import validators from '../../../../core/shared/validators.js';

class CreateMentorUseCase {
  constructor() {
    this.repository = new MentorRepository();
  }

  /**
   * Выполнить создание ментора
   * @param {Object} data - Данные ментора
   * @returns {Promise<Object>} Созданный ментор
   */
  async execute(data) {
    try {
      // 1. Валидация данных
      const validation = this.validate(data);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(', '));
      }

      // 2. Проверка уникальности email
      const isEmailUnique = await this.repository.isEmailUnique(data.email);
      if (!isEmailUnique) {
        throw new Error('Ментор с таким email уже существует');
      }

      // 3. Создание сущности
      const mentor = new MentorEntity(data);

      // 4. Валидация сущности
      const entityValidation = mentor.validate();
      if (!entityValidation.isValid) {
        throw new Error(entityValidation.errors.join(', '));
      }

      // 5. Сохранение
      const savedMentor = await this.repository.save(mentor);

      // 6. Публикация события
      eventBus.publish('mentor:created', {
        mentorId: savedMentor.id,
        fullName: savedMentor.fullName,
        email: savedMentor.email
      });

      console.log('[CreateMentorUseCase] Mentor created:', savedMentor.id);

      return savedMentor;

    } catch (error) {
      console.error('[CreateMentorUseCase] Error:', error);
      throw error;
    }
  }

  /**
   * Валидация входных данных
   */
  validate(data) {
    const errors = {};

    // ФИО
    const fullNameValidation = validators.fullName(data.fullName);
    if (!fullNameValidation.isValid) {
      errors.fullName = fullNameValidation.error;
    }

    // Email
    const emailValidation = validators.email(data.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error;
    }

    // Телефон (опционально)
    if (data.phone) {
      const phoneValidation = validators.phone(data.phone);
      if (!phoneValidation.isValid) {
        errors.phone = phoneValidation.error;
      }
    }

    // Специализация
    const specializationValidation = validators.required(data.specialization, 'Специализация');
    if (!specializationValidation.isValid) {
      errors.specialization = specializationValidation.error;
    }

    // Ставка
    const rateValidation = validators.number(data.hourlyRate, {
      min: 0.01,
      max: 100000,
      fieldName: 'Ставка'
    });
    if (!rateValidation.isValid) {
      errors.hourlyRate = rateValidation.error;
    }

    // Дата начала
    const startDateValidation = validators.date(data.startDate, {
      fieldName: 'Дата начала'
    });
    if (!startDateValidation.isValid) {
      errors.startDate = startDateValidation.error;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export default CreateMentorUseCase;

