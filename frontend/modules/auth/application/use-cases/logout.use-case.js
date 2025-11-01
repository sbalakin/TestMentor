/**
 * Logout Use Case
 * Сценарий выхода из системы
 */

class LogoutUseCase {
  /**
   * Выполнить выход
   */
  execute() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    console.log('[LogoutUseCase] Пользователь вышел из системы');
    
    // Перенаправить на страницу логина
    window.location.href = '/modules/auth/presentation/pages/login.html';
  }
}

export default LogoutUseCase;

