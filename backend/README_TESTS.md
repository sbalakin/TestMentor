# Backend Tests - Quick Start

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
pip install -r requirements-test.txt
```

### 2. Запуск всех тестов

```bash
pytest
```

### 3. Запуск с coverage

```bash
pytest --cov=modules --cov=core --cov-report=html
open htmlcov/index.html
```

## 📊 Доступные тесты

### Unit Tests (14 тестов)

- **Auth Service** (`tests/unit/auth/test_auth_service.py`)
  - Хеширование паролей
  - JWT токены
  
- **Mentor Entity** (`tests/unit/mentors/test_mentor_entity.py`)
  - Создание ментора
  - Валидация полей

### Integration Tests (27 тестов)

- **Auth API** (`tests/integration/test_auth_api.py`)
  - Регистрация
  - Логин
  - Получение пользователя
  
- **Mentors API** (`tests/integration/test_mentors_api.py`)
  - CRUD операции
  - Валидация
  
- **Work Records API** (`tests/integration/test_work_records_api.py`)
  - CRUD операции
  - Фильтрация

## 🎯 Примеры команд

```bash
# Только unit тесты
pytest tests/unit -v

# Только integration тесты
pytest tests/integration -v

# Конкретный файл
pytest tests/unit/auth/test_auth_service.py -v

# С маркерами
pytest -m auth
pytest -m "not slow"

# Остановиться на первой ошибке
pytest -x

# Показать локальные переменные
pytest -l

# Debug режим
pytest --pdb
```

## 📈 Coverage

Текущее покрытие: **~80%**

```bash
pytest --cov=modules --cov=core --cov-report=term-missing
```

## 🔧 Структура

```
tests/
├── conftest.py              # Fixtures
├── unit/
│   ├── auth/
│   │   └── test_auth_service.py
│   └── mentors/
│       └── test_mentor_entity.py
├── integration/
│   ├── test_auth_api.py
│   ├── test_mentors_api.py
│   └── test_work_records_api.py
└── fixtures/
```

## ✅ Все тесты должны проходить!

Запустите `pytest` перед commit'ом.

