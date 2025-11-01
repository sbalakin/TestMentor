/**
 * Login Use Case
 * Сценарий логина пользователя
 */

import api from '../../../../core/shared/api.js';

class LoginUseCase {
  /**
   * Выполнить логин
   * @param {string} username - Имя пользователя
   * @param {string} password - Пароль
   * @returns {Promise<Object>} - Данные пользователя и токен
   */
  async execute(username, password) {
    try {
      const response = await api.post('/auth/login', {
        username,
        password
      });

      // Сохранить токен и данные пользователя
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));

      console.log('[LoginUseCase] Успешный вход:', response.user);

      return response;
    } catch (error) {
      console.error('[LoginUseCase] Ошибка логина:', error);
      throw error;
    }
  }
}

export default LoginUseCase;

