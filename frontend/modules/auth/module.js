/**
 * Auth Module
 * Модуль аутентификации
 */

import authService from './infrastructure/auth.service.js';
import LogoutUseCase from './application/use-cases/logout.use-case.js';

class AuthModule {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.authService = authService;
    this.logoutUseCase = new LogoutUseCase();
  }

  async init() {
    console.log('[AuthModule] Инициализация...');

    // Подписаться на событие выхода
    this.eventBus.subscribe('auth:logout', () => {
      this.logoutUseCase.execute();
    });

    // Проверить авторизацию
    const isAuth = this.authService.isAuthenticated();
    console.log('[AuthModule] Статус авторизации:', isAuth);

    if (isAuth) {
      const user = this.authService.getCurrentUser();
      console.log('[AuthModule] Текущий пользователь:', user);
    }
  }

  getName() {
    return 'auth';
  }
}

export default AuthModule;

