/**
 * E2E тесты для страницы логина и входа в админ-панель
 */
import { test, expect } from '@playwright/test';

test.describe('Вход в систему', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8000/login.html');
  });

  test('Должна отображаться страница логина', async ({ page }) => {
    await expect(page).toHaveTitle(/Вход в систему/);
    await expect(page.locator('h1')).toContainText('Добро пожаловать');
  });

  test('Должны быть видны поля ввода', async ({ page }) => {
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Должны отображаться тестовые аккаунты', async ({ page }) => {
    await expect(page.locator('.demo-accounts')).toBeVisible();
    await expect(page.locator('.demo-accounts')).toContainText('admin');
    await expect(page.locator('.demo-accounts')).toContainText('mentor1');
  });

  test('Руководитель должен попасть в админ-панель', async ({ page }) => {
    // Ввести данные
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    
    // Нажать кнопку входа
    await page.click('button[type="submit"]');
    
    // Проверить редирект в админ-панель
    await expect(page).toHaveURL(/admin-panel/);
    await expect(page.locator('.logo')).toContainText('Админ-панель');
  });

  test('Ментор должен попасть в личный кабинет', async ({ page }) => {
    // Ввести данные
    await page.fill('#username', 'mentor1');
    await page.fill('#password', 'mentor1123');
    
    // Нажать кнопку входа
    await page.click('button[type="submit"]');
    
    // Проверить редирект в личный кабинет
    await expect(page).toHaveURL(/mentor-cabinet/);
  });

  test('Неправильный пароль должен показать ошибку', async ({ page }) => {
    await page.fill('#username', 'admin');
    await page.fill('#password', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    // Подождать ответ от сервера
    await page.waitForTimeout(500);
    
    // Должно остаться на странице логина
    await expect(page).toHaveURL(/login.html/);
    
    // Должна появиться ошибка с классом show
    await expect(page.locator('#loginError.show')).toBeVisible();
  });

  test('Пустые поля должны показать валидацию', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    // Должна появиться HTML5 валидация
    const usernameInput = page.locator('#username');
    await expect(usernameInput).toHaveAttribute('required', '');
  });
});

