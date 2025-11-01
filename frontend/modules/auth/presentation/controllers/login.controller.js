/**
 * Login Controller
 * Контроллер страницы логина
 */

import LoginUseCase from '../../application/use-cases/login.use-case.js';
import authService from '../../infrastructure/auth.service.js';

class LoginController {
  constructor() {
    this.loginUseCase = new LoginUseCase();
  }

  init() {
    console.log('[LoginController] Инициализация...');

    // Если уже авторизован - перенаправить на главную
    if (authService.isAuthenticated()) {
      console.log('[LoginController] Пользователь уже авторизован, редирект...');
      window.location.href = '/index.html';
      return;
    }

    this.setupForm();
  }

  setupForm() {
    const form = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const errorMessage = document.getElementById('errorMessage');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = usernameInput.value.trim();
      const password = passwordInput.value;

      if (!username || !password) {
        this.showError('Заполните все поля');
        return;
      }

      // Показать loading
      loginButton.disabled = true;
      loginButton.classList.add('loading');
      loginButton.textContent = 'Вход...';
      errorMessage.style.display = 'none';

      try {
        const result = await this.loginUseCase.execute(username, password);

        console.log('[LoginController] Успешный вход:', result.user);

        // Перенаправление в зависимости от роли
        if (result.user.role === 'MENTOR') {
          // Ментор -> страница просмотра своих работ
          window.location.href = '/modules/work-records/presentation/pages/view-works.html';
        } else {
          // Руководитель -> главная страница (дашборд)
          window.location.href = '/index.html';
        }

      } catch (error) {
        console.error('[LoginController] Ошибка:', error);
        
        let message = 'Ошибка входа в систему';
        if (error.message) {
          if (error.message.includes('401') || error.message.includes('Неверные')) {
            message = 'Неверное имя пользователя или пароль';
          } else if (error.message.includes('Failed to fetch')) {
            message = 'Не удалось подключиться к серверу';
          } else {
            message = error.message;
          }
        }
        
        this.showError(message);
        
        // Убрать loading
        loginButton.disabled = false;
        loginButton.classList.remove('loading');
        loginButton.textContent = 'Войти';
      }
    });
  }

  showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

export default LoginController;

