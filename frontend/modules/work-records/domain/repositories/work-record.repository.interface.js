/**
 * Work Record Repository Interface
 * Контракт для работы с хранилищем записей о работе
 */

class IWorkRecordRepository {
  /**
   * Получить все записи
   * @returns {Promise<Array>}
   */
  async findAll() {
    throw new Error('Method not implemented');
  }

  /**
   * Получить запись по ID
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Получить записи по ментору
   * @param {string} mentorId
   * @returns {Promise<Array>}
   */
  async findByMentor(mentorId) {
    throw new Error('Method not implemented');
  }

  /**
   * Получить записи за период
   * @param {string} startDate
   * @param {string} endDate
   * @returns {Promise<Array>}
   */
  async findByDateRange(startDate, endDate) {
    throw new Error('Method not implemented');
  }

  /**
   * Получить записи за месяц
   * @param {number} year
   * @param {number} month
   * @returns {Promise<Array>}
   */
  async findByMonth(year, month) {
    throw new Error('Method not implemented');
  }

  /**
   * Сохранить запись
   * @param {Object} workRecord
   * @returns {Promise<Object>}
   */
  async save(workRecord) {
    throw new Error('Method not implemented');
  }

  /**
   * Обновить запись
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    throw new Error('Method not implemented');
  }

  /**
   * Удалить запись
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }
}

export default IWorkRecordRepository;

