/**
 * E2E тесты для личного кабинета ментора
 */
import { test, expect } from '@playwright/test';

test.describe('Личный кабинет ментора', () => {
  
  test.beforeEach(async ({ page }) => {
    // Войти как ментор
    await page.goto('http://localhost:8000/login.html');
    await page.fill('#username', 'mentor1');
    await page.fill('#password', 'mentor1123');
    await page.click('button[type="submit"]');
    
    // Подождать редиректа
    await page.waitForURL(/mentor-cabinet/);
  });

  test('Должна отображаться главная страница ментора', async ({ page }) => {
    await expect(page.locator('.mentor-header')).toBeVisible();
    await expect(page.locator('.mentor-profile')).toBeVisible();
  });

  test('Должен отображаться профиль ментора', async ({ page }) => {
    await expect(page.locator('#mentorName')).toBeVisible();
    await expect(page.locator('#mentorSpecialization')).toBeVisible();
    await expect(page.locator('#mentorEmail')).toBeVisible();
  });

  test('Должна отображаться статистика', async ({ page }) => {
    await expect(page.locator('.quick-stats')).toBeVisible();
    await expect(page.locator('#totalWorks')).toBeVisible();
    await expect(page.locator('#totalHours')).toBeVisible();
    await expect(page.locator('#totalEarnings')).toBeVisible();
  });

  test('Должны быть кнопки быстрых действий', async ({ page }) => {
    const addWorkBtn = page.locator('button:has-text("Добавить запись")');
    const myWorksBtn = page.locator('button:has-text("Мои записи")');
    const profileBtn = page.locator('button:has-text("Мой профиль")');
    
    await expect(addWorkBtn).toBeVisible();
    await expect(myWorksBtn).toBeVisible();
    await expect(profileBtn).toBeVisible();
  });

  test('Должна быть навигация', async ({ page }) => {
    // В mentor-cabinet/index.html навигация представлена кнопками быстрых действий
    await expect(page.locator('.action-buttons')).toBeVisible();
    
    // Проверить кнопки быстрого доступа
    await expect(page.locator('button:has-text("Мои записи")')).toBeVisible();
    await expect(page.locator('button:has-text("Добавить запись")')).toBeVisible();
    await expect(page.locator('button:has-text("Мой профиль")')).toBeVisible();
  });

  test('Ментор НЕ должен видеть ссылку на главную админки', async ({ page }) => {
    const adminLink = page.locator('a[href*="/admin-panel"]');
    await expect(adminLink).not.toBeVisible();
  });

  test('Должен открываться список записей', async ({ page }) => {
    // Кликнуть по кнопке "Мои записи"
    await page.click('button:has-text("Мои записи")');
    
    // Подождать перехода
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/my-works/);
    await expect(page.locator('.logo')).toContainText('Мои записи');
  });

  test('Должна открываться форма добавления работы', async ({ page }) => {
    // Кликнуть по кнопке "Добавить запись"
    await page.click('button:has-text("Добавить запись")');
    
    // Подождать перехода
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/add-work/);
    await expect(page.locator('.logo')).toContainText('Добавить');
  });

  test('Должен открываться профиль', async ({ page }) => {
    // Кликнуть по кнопке "Мой профиль"
    await page.click('button:has-text("Мой профиль")');
    
    // Подождать перехода
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/my-profile/);
    await expect(page.locator('.logo')).toContainText('профиль');
  });

  test('Должна быть кнопка выхода', async ({ page }) => {
    const logoutBtn = page.locator('.logout-btn');
    await expect(logoutBtn).toBeVisible();
  });
});

test.describe('Личный кабинет: Добавление работы', () => {
  
  test.beforeEach(async ({ page }) => {
    // Войти как ментор
    await page.goto('http://localhost:8000/login.html');
    await page.fill('#username', 'mentor1');
    await page.fill('#password', 'mentor1123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/mentor-cabinet/);
    
    // Перейти на форму добавления
    await page.goto('http://localhost:8000/mentor-cabinet/pages/add-work.html');
  });

  test('Должна отображаться форма', async ({ page }) => {
    await expect(page.locator('#addWorkForm')).toBeVisible();
    await expect(page.locator('#workDate')).toBeVisible();
    await expect(page.locator('#category')).toBeVisible();
    await expect(page.locator('#hours')).toBeVisible();
    await expect(page.locator('#description')).toBeVisible();
  });

  test('Должен отображаться расчет суммы', async ({ page }) => {
    await expect(page.locator('#calculatedAmount')).toBeVisible();
    await expect(page.locator('#hourlyRate')).toBeVisible();
  });

  test('Должен автоматически рассчитываться размер оплаты', async ({ page }) => {
    // Подождать загрузки ставки
    await page.waitForTimeout(1000);
    
    // Ввести часы
    await page.fill('#hours', '5');
    
    // Подождать расчета
    await page.waitForTimeout(500);
    
    // Сумма должна обновиться
    const amount = await page.locator('#calculatedAmount').textContent();
    expect(amount).not.toBe('0 ₽');
  });

  test('Форма должна валидировать обязательные поля', async ({ page }) => {
    // Попробовать отправить пустую форму
    await page.click('#submitBtn');
    
    // HTML5 валидация должна сработать
    const dateInput = page.locator('#workDate');
    await expect(dateInput).toHaveAttribute('required', '');
  });
});

