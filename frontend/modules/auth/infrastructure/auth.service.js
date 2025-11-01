/**
 * Auth Service
 * Сервис для работы с аутентификацией
 */

class AuthService {
  /**
   * Проверить авторизован ли пользователь
   */
  isAuthenticated() {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  /**
   * Получить текущего пользователя
   */
  getCurrentUser() {
    const userJson = localStorage.getItem('auth_user');
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Получить токен
   */
  getToken() {
    return localStorage.getItem('auth_token');
  }

  /**
   * Проверить роль пользователя
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }

  /**
   * Проверить что пользователь - руководитель
   */
  isManager() {
    return this.hasRole('MANAGER');
  }

  /**
   * Проверить что пользователь - ментор
   */
  isMentor() {
    return this.hasRole('MENTOR');
  }

  /**
   * Требовать авторизацию (редирект если не авторизован)
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/modules/auth/presentation/pages/login.html';
      return false;
    }
    return true;
  }

  /**
   * Требовать роль руководителя
   */
  requireManager() {
    if (!this.requireAuth()) return false;
    
    if (!this.isManager()) {
      alert('Доступ запрещен. Требуется роль руководителя.');
      window.location.href = '/index.html';
      return false;
    }
    
    return true;
  }
}

const authService = new AuthService();
export default authService;

