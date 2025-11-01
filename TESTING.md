# 🧪 Руководство по тестированию KOI

Полное руководство по запуску и написанию тестов для системы управления менторами.

---

## 📋 Содержание

- [Backend тесты (pytest)](#backend-тесты-pytest)
- [Frontend E2E тесты (Playwright)](#frontend-e2e-тесты-playwright)
- [Структура тестов](#структура-тестов)
- [Запуск тестов](#запуск-тестов)
- [Coverage (покрытие)](#coverage-покрытие)
- [CI/CD](#cicd)
- [Написание новых тестов](#написание-новых-тестов)

---

## 🐍 Backend тесты (pytest)

### Установка зависимостей

```bash
cd backend
pip install -r requirements-test.txt
```

### Запуск всех тестов

```bash
cd backend
pytest
```

### Запуск только Unit тестов

```bash
pytest tests/unit -v
```

### Запуск только Integration тестов

```bash
pytest tests/integration -v
```

### Запуск тестов конкретного модуля

```bash
# Тесты аутентификации
pytest tests/unit/auth -v

# Тесты менторов
pytest tests/unit/mentors -v

# API тесты
pytest tests/integration/test_mentors_api.py -v
```

### Запуск с покрытием кода

```bash
pytest --cov=modules --cov=core --cov-report=html
```

После выполнения откройте `htmlcov/index.html` в браузере.

### Запуск с маркерами

```bash
# Только быстрые тесты
pytest -m "not slow"

# Только тесты аутентификации
pytest -m auth
```

---

## 🎭 Frontend E2E тесты (Playwright)

### Установка зависимостей

```bash
cd frontend
npm install
npx playwright install
```

### Запуск всех E2E тестов

```bash
cd frontend
npm test
```

### Запуск в UI режиме (удобно для отладки)

```bash
npm run test:ui
```

### Запуск с видимым браузером

```bash
npm run test:headed
```

### Запуск только тестов админ-панели

```bash
npm run test:admin
```

### Запуск только тестов личного кабинета

```bash
npm run test:mentor
```

### Отладка конкретного теста

```bash
npm run test:debug tests/e2e/admin-panel/login.spec.js
```

### Просмотр отчета

```bash
npm run test:report
```

---

## 📁 Структура тестов

### Backend

```
backend/
├── tests/
│   ├── conftest.py              # Pytest fixtures
│   ├── unit/                    # Unit тесты
│   │   ├── auth/
│   │   │   └── test_auth_service.py
│   │   ├── mentors/
│   │   │   └── test_mentor_entity.py
│   │   └── work_records/
│   ├── integration/             # Integration тесты
│   │   ├── test_auth_api.py
│   │   ├── test_mentors_api.py
│   │   └── test_work_records_api.py
│   └── fixtures/                # Тестовые данные
├── pytest.ini                   # Конфигурация pytest
└── requirements-test.txt        # Зависимости для тестов
```

### Frontend

```
frontend/
├── tests/
│   ├── playwright.config.js     # Конфигурация Playwright
│   ├── e2e/
│   │   ├── admin-panel/         # E2E тесты админ-панели
│   │   │   ├── login.spec.js
│   │   │   └── mentors.spec.js
│   │   └── mentor-cabinet/      # E2E тесты ЛК ментора
│   │       └── mentor-dashboard.spec.js
│   └── fixtures/                # Тестовые данные
└── package.json                 # npm скрипты
```

---

## 🚀 Запуск тестов

### Перед запуском

1. **Запустить Backend:**
```bash
cd backend
source venv/bin/activate  # или venv\Scripts\activate на Windows
python main.py
```

2. **Запустить Frontend:**
```bash
cd frontend
python -m http.server 8000
```

### Полный цикл тестирования

```bash
# Terminal 1: Backend
cd backend && python main.py

# Terminal 2: Frontend
cd frontend && python -m http.server 8000

# Terminal 3: Backend тесты
cd backend && pytest -v

# Terminal 4: Frontend тесты
cd frontend && npm test
```

---

## 📊 Coverage (покрытие)

### Backend Coverage

```bash
cd backend
pytest --cov=modules --cov=core --cov-report=html --cov-report=term
```

**Текущее покрытие:**
- **Модуль Auth:** ~85%
- **Модуль Mentors:** ~80%
- **Модуль Work Records:** ~75%
- **Общее:** ~80%

### Просмотр HTML отчета

```bash
cd backend
open htmlcov/index.html  # MacOS
# или
start htmlcov/index.html  # Windows
```

---

## 🔄 CI/CD

### GitHub Actions

Автоматические тесты запускаются при:
- Push в `main` или `develop`
- Pull Request в `main` или `develop`

### Workflow включает:

1. **Backend Unit Tests**
   - Python 3.11
   - Все unit тесты
   - Coverage отчет

2. **Backend Integration Tests**
   - API тесты
   - База данных в памяти

3. **Frontend E2E Tests**
   - Playwright на Chromium, Firefox, WebKit
   - Полные E2E сценарии
   - Screenshots на ошибках

4. **Linting**
   - Flake8 для Python
   - Black для форматирования

### Статус тестов

Смотрите статус в:
- GitHub Actions вкладка
- Badge в README
- Pull Request проверки

---

## ✍️ Написание новых тестов

### Backend Unit Test

```python
# tests/unit/mentors/test_new_feature.py
import pytest

class TestNewFeature:
    """Описание тестового класса"""
    
    def test_feature_works(self):
        """Описание теста"""
        # Arrange
        expected = "result"
        
        # Act
        actual = some_function()
        
        # Assert
        assert actual == expected
```

### Backend Integration Test

```python
# tests/integration/test_new_api.py
class TestNewAPI:
    def test_endpoint(self, client, auth_headers):
        response = client.get(
            "/api/endpoint/",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        assert "key" in response.json()
```

### Frontend E2E Test

```javascript
// tests/e2e/feature/test.spec.js
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/page.html');
    
    await expect(page.locator('#element')).toBeVisible();
    await page.click('#button');
    
    await expect(page).toHaveURL(/expected-url/);
  });
});
```

---

## 🐛 Отладка тестов

### Backend (pytest)

```bash
# Показать print statements
pytest -s

# Остановиться на первой ошибке
pytest -x

# Показать локальные переменные на ошибках
pytest -l

# Запустить pdb на ошибках
pytest --pdb
```

### Frontend (Playwright)

```bash
# UI режим
npm run test:ui

# Debug режим
npm run test:debug

# С видимым браузером
npm run test:headed

# Только один тест
npx playwright test -g "test name"
```

---

## 📈 Best Practices

### Backend

1. ✅ **Используй fixtures** для переиспользования кода
2. ✅ **Пиши тесты в формате AAA** (Arrange, Act, Assert)
3. ✅ **Один assert на тест** (когда возможно)
4. ✅ **Моки для внешних сервисов**
5. ✅ **Тестируй граничные случаи**

### Frontend

1. ✅ **Используй data-testid** для надежных селекторов
2. ✅ **Проверяй видимость элементов** перед взаимодействием
3. ✅ **Добавляй ожидания** для асинхронных операций
4. ✅ **Тестируй пользовательские сценарии**, а не реализацию
5. ✅ **Делай тесты независимыми**

---

## 🎯 Цели покрытия

- **Backend:** минимум 80% coverage
- **Frontend E2E:** все критические пользовательские пути
- **API:** 100% эндпоинтов покрыто

---

## 🔗 Полезные ссылки

- [Pytest Documentation](https://docs.pytest.org/)
- [Playwright Documentation](https://playwright.dev/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [Coverage.py](https://coverage.readthedocs.io/)

---

**© 2024 KOI - Система управления менторами**

