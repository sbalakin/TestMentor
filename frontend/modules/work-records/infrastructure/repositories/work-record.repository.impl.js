/**
 * Work Record Repository Implementation
 * Реализация работы с хранилищем записей о работе через Backend API
 */

import api from '../../../../core/shared/api.js';
import WorkRecordEntity from '../../domain/entities/work-record.entity.js';

class WorkRecordRepository {
  constructor() {
    this.endpoint = '/work-records';
  }

  /**
   * Преобразовать DTO из API в Entity
   */
  _dtoToEntity(dto) {
    return WorkRecordEntity.fromJSON({
      id: dto.id,
      mentorId: dto.mentorId,
      date: dto.date,
      hours: dto.hours,
      description: dto.description,
      category: dto.category,
      status: dto.status,
      notes: dto.notes,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt
    });
  }

  /**
   * Преобразовать Entity в DTO для API
   */
  _entityToDto(entity) {
    return {
      mentorId: entity.mentorId,
      date: entity.date,
      hours: entity.hours,
      description: entity.description,
      category: entity.category,
      status: entity.status,
      notes: entity.notes
    };
  }

  /**
   * Получить все записи
   */
  async findAll() {
    try {
      const data = await api.get(this.endpoint);
      return data.map(dto => this._dtoToEntity(dto));
    } catch (error) {
      console.error('[WorkRecordRepository] Error fetching all:', error);
      throw new Error('Не удалось загрузить записи о работе');
    }
  }

  /**
   * Получить запись по ID
   */
  async findById(id) {
    try {
      const data = await api.get(`${this.endpoint}/${id}`);
      return this._dtoToEntity(data);
    } catch (error) {
      if (error.message.includes('404')) {
        return null;
      }
      console.error('[WorkRecordRepository] Error fetching by ID:', error);
      throw new Error('Не удалось загрузить запись');
    }
  }

  /**
   * Получить записи по ментору
   */
  async findByMentor(mentorId) {
    try {
      const data = await api.get(`${this.endpoint}?mentor_id=${mentorId}`);
      return data.map(dto => this._dtoToEntity(dto));
    } catch (error) {
      console.error('[WorkRecordRepository] Error fetching by mentor:', error);
      throw new Error('Не удалось загрузить записи ментора');
    }
  }

  /**
   * Получить записи за период
   */
  async findByDateRange(startDate, endDate) {
    try {
      const data = await api.get(`${this.endpoint}?start_date=${startDate}&end_date=${endDate}`);
      return data.map(dto => this._dtoToEntity(dto));
    } catch (error) {
      console.error('[WorkRecordRepository] Error fetching by date range:', error);
      throw new Error('Не удалось загрузить записи за период');
    }
  }

  /**
   * Получить записи за месяц
   */
  async findByMonth(year, month) {
    const records = await this.findAll();
    return records.filter(record => {
      const monthYear = record.getMonthYear();
      return monthYear.year === year && monthYear.month === month;
    });
  }

  /**
   * Сохранить запись
   */
  async save(workRecord) {
    try {
      const dto = this._entityToDto(workRecord);
      const data = await api.post(this.endpoint, dto);
      return this._dtoToEntity(data);
    } catch (error) {
      console.error('[WorkRecordRepository] Error saving:', error);
      throw new Error(error.message || 'Не удалось сохранить запись');
    }
  }

  /**
   * Обновить запись
   */
  async update(id, data) {
    try {
      const dto = this._entityToDto(data);
      const updated = await api.put(`${this.endpoint}/${id}`, dto);
      return this._dtoToEntity(updated);
    } catch (error) {
      console.error('[WorkRecordRepository] Error updating:', error);
      throw new Error(error.message || 'Не удалось обновить запись');
    }
  }

  /**
   * Удалить запись
   */
  async delete(id) {
    try {
      await api.delete(`${this.endpoint}/${id}`);
      return true;
    } catch (error) {
      if (error.message.includes('404')) {
        return false;
      }
      console.error('[WorkRecordRepository] Error deleting:', error);
      throw new Error('Не удалось удалить запись');
    }
  }

  /**
   * Получить статистику по ментору за период
   */
  async getMentorStats(mentorId, startDate, endDate) {
    const records = await this.findByMentor(mentorId);
    
    const filtered = records.filter(record => {
      if (!startDate && !endDate) return true;
      
      const recordDate = new Date(record.date);
      if (startDate && recordDate < new Date(startDate)) return false;
      if (endDate && recordDate > new Date(endDate)) return false;
      
      return true;
    });

    const totalHours = filtered.reduce((sum, record) => sum + record.hours, 0);
    const completedRecords = filtered.filter(r => r.isCompleted()).length;
    const approvedRecords = filtered.filter(r => r.isApproved()).length;

    return {
      totalRecords: filtered.length,
      totalHours,
      completedRecords,
      approvedRecords,
      records: filtered
    };
  }
}

export default WorkRecordRepository;

