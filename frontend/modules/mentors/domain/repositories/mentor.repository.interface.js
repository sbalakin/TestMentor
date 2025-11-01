/**
 * Mentor Repository Interface
 * Контракт для работы с хранилищем менторов
 */

class IMentorRepository {
  /**
   * Получить всех менторов
   * @returns {Promise<Array>}
   */
  async findAll() {
    throw new Error('Method not implemented');
  }

  /**
   * Получить ментора по ID
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Получить ментора по email
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    throw new Error('Method not implemented');
  }

  /**
   * Сохранить ментора
   * @param {Object} mentor
   * @returns {Promise<Object>}
   */
  async save(mentor) {
    throw new Error('Method not implemented');
  }

  /**
   * Обновить ментора
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    throw new Error('Method not implemented');
  }

  /**
   * Удалить ментора
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Поиск менторов
   * @param {string} query
   * @returns {Promise<Array>}
   */
  async search(query) {
    throw new Error('Method not implemented');
  }

  /**
   * Фильтр по статусу
   * @param {string} status
   * @returns {Promise<Array>}
   */
  async findByStatus(status) {
    throw new Error('Method not implemented');
  }
}

export default IMentorRepository;

