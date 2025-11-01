/**
 * Mentor Repository Implementation
 * Реализация работы с хранилищем менторов через Backend API
 */

import api from '../../../../core/shared/api.js';
import MentorEntity from '../../domain/entities/mentor.entity.js';

class MentorRepository {
  constructor() {
    this.endpoint = '/mentors';
  }

  /**
   * Преобразовать DTO из API в Entity
   */
  _dtoToEntity(dto) {
    return MentorEntity.fromJSON({
      id: dto.id,
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      photoUrl: dto.photoUrl,
      specialization: dto.specialization,
      hourlyRate: dto.hourlyRate,
      startDate: dto.startDate,
      status: dto.status,
      passportOrInn: dto.passportOrInn,
      bankDetails: dto.bankDetails,
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
      fullName: entity.fullName,
      email: entity.email,
      phone: entity.phone,
      photoUrl: entity.photoUrl,
      specialization: entity.specialization,
      hourlyRate: entity.hourlyRate,
      startDate: entity.startDate,
      status: entity.status,
      passportOrInn: entity.passportOrInn,
      bankDetails: entity.bankDetails,
      notes: entity.notes
    };
  }

  /**
   * Получить всех менторов
   */
  async findAll() {
    try {
      const data = await api.get(this.endpoint);
      return data.map(dto => this._dtoToEntity(dto));
    } catch (error) {
      console.error('[MentorRepository] Error fetching all:', error);
      throw new Error('Не удалось загрузить список менторов');
    }
  }

  /**
   * Получить ментора по ID
   */
  async findById(id) {
    try {
      const data = await api.get(`${this.endpoint}/${id}`);
      return this._dtoToEntity(data);
    } catch (error) {
      if (error.message.includes('404')) {
        return null;
      }
      console.error('[MentorRepository] Error fetching by ID:', error);
      throw new Error('Не удалось загрузить ментора');
    }
  }

  /**
   * Получить ментора по email
   */
  async findByEmail(email) {
    const mentors = await this.findAll();
    return mentors.find(mentor => mentor.email.toLowerCase() === email.toLowerCase()) || null;
  }

  /**
   * Сохранить ментора
   */
  async save(mentor) {
    try {
      const dto = this._entityToDto(mentor);
      const data = await api.post(this.endpoint, dto);
      return this._dtoToEntity(data);
    } catch (error) {
      console.error('[MentorRepository] Error saving:', error);
      throw new Error(error.message || 'Не удалось сохранить ментора');
    }
  }

  /**
   * Обновить ментора
   */
  async update(id, data) {
    try {
      const dto = this._entityToDto(data);
      const updated = await api.put(`${this.endpoint}/${id}`, dto);
      return this._dtoToEntity(updated);
    } catch (error) {
      console.error('[MentorRepository] Error updating:', error);
      throw new Error(error.message || 'Не удалось обновить ментора');
    }
  }

  /**
   * Удалить ментора
   */
  async delete(id) {
    try {
      await api.delete(`${this.endpoint}/${id}`);
      return true;
    } catch (error) {
      if (error.message.includes('404')) {
        return false;
      }
      console.error('[MentorRepository] Error deleting:', error);
      throw new Error('Не удалось удалить ментора');
    }
  }

  /**
   * Поиск менторов
   */
  async search(query) {
    try {
      const data = await api.get(`${this.endpoint}?search=${encodeURIComponent(query)}`);
      return data.map(dto => this._dtoToEntity(dto));
    } catch (error) {
      console.error('[MentorRepository] Error searching:', error);
      throw new Error('Не удалось выполнить поиск');
    }
  }

  /**
   * Фильтр по статусу
   */
  async findByStatus(status) {
    try {
      const data = await api.get(`${this.endpoint}?status=${status}`);
      return data.map(dto => this._dtoToEntity(dto));
    } catch (error) {
      console.error('[MentorRepository] Error filtering by status:', error);
      throw new Error('Не удалось отфильтровать менторов');
    }
  }

  /**
   * Проверить уникальность email
   */
  async isEmailUnique(email, excludeId = null) {
    const mentors = await this.findAll();
    const existing = mentors.find(m => 
      m.email.toLowerCase() === email.toLowerCase() && m.id !== excludeId
    );
    return !existing;
  }
}

export default MentorRepository;

