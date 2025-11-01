/**
 * Delete Mentor Use Case
 * Удаление ментора
 */

import MentorRepository from '../../infrastructure/repositories/mentor.repository.impl.js';
import eventBus from '../../../../core/events/event-bus.js';

class DeleteMentorUseCase {
  constructor() {
    this.repository = new MentorRepository();
  }

  /**
   * Удалить ментора
   * @param {string} id - ID ментора
   * @returns {Promise<boolean>}
   */
  async execute(id) {
    try {
      // Получаем ментора перед удалением
      const mentor = await this.repository.findById(id);
      if (!mentor) {
        throw new Error('Ментор не найден');
      }

      // Удаляем
      const deleted = await this.repository.delete(id);

      if (deleted) {
        // Публикуем событие
        eventBus.publish('mentor:deleted', {
          mentorId: id,
          fullName: mentor.fullName
        });

        console.log('[DeleteMentorUseCase] Mentor deleted:', id);
      }

      return deleted;

    } catch (error) {
      console.error('[DeleteMentorUseCase] Error:', error);
      throw error;
    }
  }

  /**
   * Деактивировать ментора (мягкое удаление)
   * @param {string} id - ID ментора
   * @returns {Promise<Object>}
   */
  async deactivate(id) {
    try {
      const mentor = await this.repository.findById(id);
      if (!mentor) {
        throw new Error('Ментор не найден');
      }

      mentor.deactivate();
      const updated = await this.repository.update(id, { status: 'inactive' });

      // Публикуем событие
      eventBus.publish('mentor:deactivated', {
        mentorId: id,
        fullName: mentor.fullName
      });

      return updated;

    } catch (error) {
      console.error('[DeleteMentorUseCase] Error deactivating:', error);
      throw error;
    }
  }
}

export default DeleteMentorUseCase;

