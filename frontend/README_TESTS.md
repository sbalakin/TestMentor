# Frontend E2E Tests - Quick Start

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
npx playwright install
```

### 2. Запуск тестов

```bash
npm test
```

### 3. UI режим (рекомендуется для разработки)

```bash
npm run test:ui
```

## 📊 Доступные тесты

### Login & Auth (6 тестов)

- Отображение страницы логина
- Вход руководителя
- Вход ментора
- Валидация ошибок

### Admin Panel (10 тестов)

- Дашборд
- Список менторов
- Навигация
- Поиск и фильтры
- Кнопка выхода

### Mentor Cabinet (13 тестов)

- Профиль ментора
- Статистика
- Мои записи
- Добавление работы
- Расчет оплаты

**Итого: 29 E2E тестов**

## 🎯 Примеры команд

```bash
# Все тесты
npm test

# С видимым браузером
npm run test:headed

# UI режим
npm run test:ui

# Debug режим
npm run test:debug

# Только админ-панель
npm run test:admin

# Только личный кабинет
npm run test:mentor

# Конкретный файл
npx playwright test tests/e2e/admin-panel/login.spec.js

# Конкретный тест
npx playwright test -g "Должна отображаться страница логина"

# Просмотр отчета
npm run test:report
```

## 🌐 Браузеры

Тесты запускаются в:
- Chromium
- Firefox
- WebKit (Safari)

## 🔧 Структура

```
tests/
├── playwright.config.js
├── e2e/
│   ├── admin-panel/
│   │   ├── login.spec.js
│   │   └── mentors.spec.js
│   └── mentor-cabinet/
│       └── mentor-dashboard.spec.js
└── fixtures/
```

## 📸 Screenshots & Video

При ошибках автоматически сохраняются:
- Screenshots
- Videos
- Traces

Найти в: `test-results/`

## ✅ Перед запуском

1. **Backend должен работать:**
   ```bash
   cd backend && python main.py
   ```

2. **Frontend должен работать:**
   ```bash
   cd frontend && python -m http.server 8000
   ```

3. **Запустить тесты:**
   ```bash
   npm test
   ```

## 🐛 Отладка

```bash
# Медленно с паузами
npm run test:headed --slow-mo=1000

# С консолью браузера
npm run test:headed

# Debugger
npm run test:debug
```

## ✅ Все тесты должны проходить!

Запустите `npm test` перед commit'ом.

