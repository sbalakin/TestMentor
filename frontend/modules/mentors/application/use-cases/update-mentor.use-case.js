/**
 * Update Mentor Use Case
 * Сценарий обновления данных ментора
 */

import MentorEntity from '../../domain/entities/mentor.entity.js';
import MentorRepository from '../../infrastructure/repositories/mentor.repository.impl.js';
import eventBus from '../../../../core/events/event-bus.js';
import validators from '../../../../core/shared/validators.js';

class UpdateMentorUseCase {
  constructor() {
    this.repository = new MentorRepository();
  }

  /**
   * Выполнить обновление ментора
   * @param {string} id - ID ментора
   * @param {Object} data - Новые данные ментора
   * @returns {Promise<Object>} Обновленный ментор
   */
  async execute(id, data) {
    try {
      // 1. Проверка существования ментора
      const existingMentor = await this.repository.findById(id);
      if (!existingMentor) {
        throw new Error('Ментор не найден');
      }

      // 2. Валидация данных
      const validation = this.validate(data);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(', '));
      }

      // 3. Проверка уникальности email (если он изменился)
      if (data.email && data.email !== existingMentor.email) {
        const isEmailUnique = await this.repository.isEmailUnique(data.email, id);
        if (!isEmailUnique) {
          throw new Error('Ментор с таким email уже существует');
        }
      }

      // 4. Обновление
      const updatedMentor = await this.repository.update(id, data);

      // 5. Публикация события
      eventBus.publish('mentor:updated', {
        mentorId: updatedMentor.id,
        fullName: updatedMentor.fullName,
        email: updatedMentor.email
      });

      console.log('[UpdateMentorUseCase] Mentor updated:', updatedMentor.id);

      return updatedMentor;

    } catch (error) {
      console.error('[UpdateMentorUseCase] Error:', error);
      throw error;
    }
  }

  /**
   * Валидация входных данных
   */
  validate(data) {
    const errors = {};

    // ФИО (если передано)
    if (data.fullName !== undefined) {
      const fullNameValidation = validators.fullName(data.fullName);
      if (!fullNameValidation.isValid) {
        errors.fullName = fullNameValidation.error;
      }
    }

    // Email (если передан)
    if (data.email !== undefined) {
      const emailValidation = validators.email(data.email);
      if (!emailValidation.isValid) {
        errors.email = emailValidation.error;
      }
    }

    // Телефон (если передан)
    if (data.phone !== undefined && data.phone) {
      const phoneValidation = validators.phone(data.phone);
      if (!phoneValidation.isValid) {
        errors.phone = phoneValidation.error;
      }
    }

    // Специализация (если передана)
    if (data.specialization !== undefined) {
      const specializationValidation = validators.required(data.specialization, 'Специализация');
      if (!specializationValidation.isValid) {
        errors.specialization = specializationValidation.error;
      }
    }

    // Ставка (если передана)
    if (data.hourlyRate !== undefined) {
      const rateValidation = validators.number(data.hourlyRate, {
        min: 0.01,
        max: 100000,
        fieldName: 'Ставка'
      });
      if (!rateValidation.isValid) {
        errors.hourlyRate = rateValidation.error;
      }
    }

    // Дата начала (если передана)
    if (data.startDate !== undefined) {
      const startDateValidation = validators.date(data.startDate, {
        fieldName: 'Дата начала'
      });
      if (!startDateValidation.isValid) {
        errors.startDate = startDateValidation.error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export default UpdateMentorUseCase;

