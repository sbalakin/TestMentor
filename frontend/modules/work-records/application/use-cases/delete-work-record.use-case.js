/**
 * Delete Work Record Use Case
 * Удаление записи о работе
 */

import WorkRecordRepository from '../../infrastructure/repositories/work-record.repository.impl.js';
import eventBus from '../../../../core/events/event-bus.js';

class DeleteWorkRecordUseCase {
  constructor() {
    this.repository = new WorkRecordRepository();
  }

  /**
   * Удалить запись о работе
   * @param {string} id - ID записи
   * @returns {Promise<boolean>}
   */
  async execute(id) {
    try {
      // Получаем запись перед удалением
      const workRecord = await this.repository.findById(id);
      if (!workRecord) {
        throw new Error('Запись не найдена');
      }

      // Удаляем
      const deleted = await this.repository.delete(id);

      if (deleted) {
        // Публикуем событие
        eventBus.publish('work:deleted', {
          workRecordId: id,
          mentorId: workRecord.mentorId,
          hours: workRecord.hours
        });

        console.log('[DeleteWorkRecordUseCase] Work record deleted:', id);
      }

      return deleted;

    } catch (error) {
      console.error('[DeleteWorkRecordUseCase] Error:', error);
      throw error;
    }
  }
}

export default DeleteWorkRecordUseCase;

