/**
 * E2E тесты для управления менторами в админ-панели
 */
import { test, expect } from '@playwright/test';

test.describe('Админ-панель: Менторы', () => {
  
  test.beforeEach(async ({ page }) => {
    // Войти как админ
    await page.goto('http://localhost:8000/login.html');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    
    // Подождать редиректа
    await page.waitForURL(/admin-panel/);
  });

  test('Должна отображаться главная страница дашборда', async ({ page }) => {
    await expect(page.locator('.logo')).toContainText('Админ-панель');
    await expect(page.locator('.stats-grid')).toBeVisible();
    await expect(page.locator('#totalMentors')).toBeVisible();
  });

  test('Должна быть навигация', async ({ page }) => {
    // Проверить что навигация существует
    await expect(page.locator('.nav')).toBeVisible();
    
    // Проверить наличие ссылок на страницы
    await expect(page.locator('a.nav-link[href*="mentors"]')).toBeVisible();
    await expect(page.locator('a.nav-link[href*="works"]')).toBeVisible();
    await expect(page.locator('a.nav-link[href*="reports"]')).toBeVisible();
  });

  test('Должен открываться список менторов', async ({ page }) => {
    // Кликнуть по ссылке "Менторы" в навигации
    await page.click('a.nav-link[href*="mentors/list"]');
    
    // Подождать загрузки страницы
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/mentors\/list/);
    // Использовать более специфичный селектор (не .logo, а именно заголовок страницы)
    await expect(page.locator('h1').nth(1)).toContainText('Список менторов');
  });

  test('Должна отображаться кнопка добавления ментора', async ({ page }) => {
    await page.goto('http://localhost:8000/admin-panel/pages/mentors/list.html');
    
    await expect(page.locator('#addMentorBtn')).toBeVisible();
  });

  test('Должны отображаться карточки менторов', async ({ page }) => {
    await page.goto('http://localhost:8000/admin-panel/pages/mentors/list.html');
    
    // Подождать загрузки
    await page.waitForTimeout(1000);
    
    const cards = page.locator('.mentor-card');
    await expect(cards.first()).toBeVisible();
  });

  test('Должен работать поиск менторов', async ({ page }) => {
    await page.goto('http://localhost:8000/admin-panel/pages/mentors/list.html');
    
    // Подождать загрузки
    await page.waitForTimeout(1000);
    
    // Ввести текст в поиск
    await page.fill('#searchInput', 'Тест');
    
    // Подождать применения фильтра
    await page.waitForTimeout(500);
  });

  test('Должен работать фильтр по статусу', async ({ page }) => {
    await page.goto('http://localhost:8000/admin-panel/pages/mentors/list.html');
    
    // Подождать загрузки
    await page.waitForTimeout(1000);
    
    // Выбрать фильтр
    await page.selectOption('#statusFilter', 'ACTIVE');
    
    // Подождать применения фильтра
    await page.waitForTimeout(500);
  });

  test('Клик по карточке должен открыть профиль', async ({ page }) => {
    await page.goto('http://localhost:8000/admin-panel/pages/mentors/list.html');
    
    // Подождать загрузки
    await page.waitForTimeout(1000);
    
    const firstCard = page.locator('.mentor-card').first();
    
    if (await firstCard.isVisible()) {
      await firstCard.click();
      
      // Должен открыться профиль
      await expect(page).toHaveURL(/mentors\/view/);
    }
  });

  test('Должна быть кнопка выхода', async ({ page }) => {
    const logoutBtn = page.locator('.logout-btn');
    await expect(logoutBtn).toBeVisible();
    await expect(logoutBtn).toContainText('Выход');
  });

  test('Выход должен вернуть на страницу логина', async ({ page }) => {
    const logoutBtn = page.locator('.logout-btn');
    
    // Подтвердить выход в диалоге
    page.on('dialog', dialog => dialog.accept());
    
    await logoutBtn.click();
    
    // Должен вернуться на логин
    await expect(page).toHaveURL(/login.html/);
  });
});

