/**
 * Get Work Records Use Case
 * Получение записей о работе с фильтрацией
 */

import WorkRecordRepository from '../../infrastructure/repositories/work-record.repository.impl.js';

class GetWorkRecordsUseCase {
  constructor() {
    this.repository = new WorkRecordRepository();
  }

  /**
   * Получить все записи с фильтрацией
   */
  async execute(filters = {}) {
    try {
      let records = await this.repository.findAll();

      // Фильтр по ментору
      if (filters.mentorId) {
        records = records.filter(r => r.mentorId === filters.mentorId);
      }

      // Фильтр по статусу
      if (filters.status) {
        records = records.filter(r => r.status === filters.status);
      }

      // Фильтр по категории
      if (filters.category) {
        records = records.filter(r => r.category === filters.category);
      }

      // Фильтр по дате (диапазон)
      if (filters.startDate || filters.endDate) {
        records = records.filter(r => {
          const recordDate = new Date(r.date);
          if (filters.startDate && recordDate < new Date(filters.startDate)) {
            return false;
          }
          if (filters.endDate && recordDate > new Date(filters.endDate)) {
            return false;
          }
          return true;
        });
      }

      // Фильтр по месяцу
      if (filters.month && filters.year) {
        records = records.filter(r => {
          const monthYear = r.getMonthYear();
          return monthYear.year === filters.year && monthYear.month === filters.month;
        });
      }

      // Сортировка
      if (filters.sortBy) {
        records = this.sort(records, filters.sortBy, filters.sortOrder || 'desc');
      } else {
        // По умолчанию сортируем по дате (новые сначала)
        records = this.sort(records, 'date', 'desc');
      }

      return records;

    } catch (error) {
      console.error('[GetWorkRecordsUseCase] Error:', error);
      throw error;
    }
  }

  /**
   * Получить запись по ID
   */
  async getById(id) {
    try {
      const record = await this.repository.findById(id);
      if (!record) {
        throw new Error('Запись не найдена');
      }
      return record;
    } catch (error) {
      console.error('[GetWorkRecordsUseCase] Error getting by ID:', error);
      throw error;
    }
  }

  /**
   * Получить статистику по ментору
   */
  async getMentorStats(mentorId, startDate = null, endDate = null) {
    try {
      return await this.repository.getMentorStats(mentorId, startDate, endDate);
    } catch (error) {
      console.error('[GetWorkRecordsUseCase] Error getting stats:', error);
      throw error;
    }
  }

  /**
   * Сортировка записей
   */
  sort(records, field, order = 'asc') {
    return records.sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];

      // Для дат
      if (field === 'date') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      // Для строк
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }
}

export default GetWorkRecordsUseCase;

