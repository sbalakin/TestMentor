/**
 * Get Mentors Use Case
 * Получение списка менторов с фильтрацией
 */

import MentorRepository from '../../infrastructure/repositories/mentor.repository.impl.js';

class GetMentorsUseCase {
  constructor() {
    this.repository = new MentorRepository();
  }

  /**
   * Получить всех менторов
   */
  async execute(filters = {}) {
    try {
      let mentors = await this.repository.findAll();

      // Фильтр по статусу
      if (filters.status) {
        mentors = mentors.filter(m => m.status === filters.status);
      }

      // Фильтр по специализации
      if (filters.specialization) {
        mentors = mentors.filter(m => m.specialization === filters.specialization);
      }

      // Поиск по тексту
      if (filters.search) {
        const query = filters.search.toLowerCase();
        mentors = mentors.filter(m =>
          m.fullName.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query) ||
          m.specialization.toLowerCase().includes(query)
        );
      }

      // Сортировка
      if (filters.sortBy) {
        mentors = this.sort(mentors, filters.sortBy, filters.sortOrder || 'asc');
      }

      return mentors;

    } catch (error) {
      console.error('[GetMentorsUseCase] Error:', error);
      throw error;
    }
  }

  /**
   * Сортировка менторов
   */
  sort(mentors, field, order = 'asc') {
    return mentors.sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];

      // Для строк - регистронезависимое сравнение
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Получить ментора по ID
   */
  async getById(id) {
    try {
      const mentor = await this.repository.findById(id);
      if (!mentor) {
        throw new Error('Ментор не найден');
      }
      return mentor;
    } catch (error) {
      console.error('[GetMentorsUseCase] Error getting by ID:', error);
      throw error;
    }
  }
}

export default GetMentorsUseCase;

