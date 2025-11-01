/**
 * API Service
 * Централизованный сервис для HTTP запросов к Backend API
 */

class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:8001/api';
    this.headers = {
      'Content-Type': 'application/json'
    };
  }

  /**
   * Получить заголовки с токеном авторизации
   */
  getHeaders() {
    const headers = { ...this.headers };
    
    // Добавить токен если есть
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Выполнить GET запрос
   * @param {string} endpoint - Endpoint URL
   * @returns {Promise<any>}
   */
  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('[API] GET Error:', error);
      throw error;
    }
  }

  /**
   * Выполнить POST запрос
   * @param {string} endpoint - Endpoint URL
   * @param {Object} data - Данные для отправки
   * @returns {Promise<any>}
   */
  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('[API] POST Error:', error);
      throw error;
    }
  }

  /**
   * Выполнить PUT запрос
   * @param {string} endpoint - Endpoint URL
   * @param {Object} data - Данные для обновления
   * @returns {Promise<any>}
   */
  async put(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('[API] PUT Error:', error);
      throw error;
    }
  }

  /**
   * Выполнить DELETE запрос
   * @param {string} endpoint - Endpoint URL
   * @returns {Promise<void>}
   */
  async delete(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw await this.handleError(response);
      }

      // DELETE может вернуть 204 No Content
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('[API] DELETE Error:', error);
      throw error;
    }
  }

  /**
   * Обработка ошибок API
   * @param {Response} response - Response объект
   * @returns {Promise<Error>}
   */
  async handleError(response) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch (e) {
      // Не удалось распарсить JSON ошибки
    }

    return new Error(errorMessage);
  }

  /**
   * Проверка доступности API
   * @returns {Promise<boolean>}
   */
  async checkHealth() {
    try {
      const response = await fetch('http://localhost:8001/health');
      return response.ok;
    } catch (error) {
      console.error('[API] Health check failed:', error);
      return false;
    }
  }
}

// Глобальный экземпляр
const api = new ApiService();

export default api;

