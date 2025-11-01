# Backend API - Система управления менторами

## Описание
Backend API для системы управления менторами, построенный на FastAPI с использованием SQLite базы данных и Clean Architecture.

## Технологический стек

- **FastAPI** 0.104.1 - современный Python веб-фреймворк
- **SQLAlchemy** 2.0.23 - ORM для работы с БД
- **SQLite** - легковесная БД (для production можно заменить на PostgreSQL)
- **Pydantic** 2.5.0 - валидация данных
- **Uvicorn** - ASGI сервер
- **Alembic** - миграции БД (опционально)

## Архитектура

### Модульный монолит + Clean Architecture

Каждый модуль имеет 4 слоя:

```
modules/[module-name]/
├── domain/              # Бизнес-логика (entities, repositories)
├── application/         # Use Cases, DTOs
├── infrastructure/      # Реализация (database, repositories)
└── presentation/        # API (routes, schemas)
```

### Текущие модули

1. **Mentors** - Управление менторами
2. **Work Records** - Записи о работе

## Быстрый старт

### 1. Установка зависимостей

```bash
cd backend

# Создать виртуальное окружение
python3 -m venv venv

# Активировать
source venv/bin/activate  # MacOS/Linux
# или
venv\Scripts\activate  # Windows

# Установить зависимости
pip install -r requirements.txt
```

### 2. Запуск сервера

```bash
python main.py
```

Сервер запустится на **http://localhost:8001**

### 3. Документация API

После запуска доступна интерактивная документация:

- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

## API Endpoints

### Mentors (Менторы)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/mentors` | Получить всех менторов |
| GET | `/api/mentors/{id}` | Получить ментора по ID |
| POST | `/api/mentors` | Создать ментора |
| PUT | `/api/mentors/{id}` | Обновить ментора |
| DELETE | `/api/mentors/{id}` | Удалить ментора |

**Query параметры для GET /api/mentors**:
- `status` - фильтр по статусу (active/inactive)
- `search` - поиск по имени, email, специализации

### Work Records (Записи о работе)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/work-records` | Получить все записи |
| GET | `/api/work-records/{id}` | Получить запись по ID |
| POST | `/api/work-records` | Создать запись |
| DELETE | `/api/work-records/{id}` | Удалить запись |

**Query параметры для GET /api/work-records**:
- `mentor_id` - фильтр по ID ментора
- `start_date` - начальная дата (YYYY-MM-DD)
- `end_date` - конечная дата (YYYY-MM-DD)

## Примеры запросов

### Создать ментора

```bash
curl -X POST "http://localhost:8001/api/mentors" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Иванов Иван Иванович",
    "email": "ivanov@example.com",
    "phone": "+7 (999) 123-45-67",
    "specialization": "Разработка ботов",
    "hourlyRate": 1500,
    "startDate": "2025-01-01",
    "status": "active"
  }'
```

### Получить всех менторов

```bash
curl "http://localhost:8001/api/mentors"
```

### Создать запись о работе

```bash
curl -X POST "http://localhost:8001/api/work-records" \
  -H "Content-Type: application/json" \
  -d '{
    "mentorId": "mentor_abc123",
    "date": "2025-10-31",
    "hours": 8.0,
    "description": "Обучение основам Python",
    "category": "mentoring",
    "status": "completed"
  }'
```

## База данных

### SQLite

По умолчанию используется SQLite файл: `mentor_system.db`

База создается автоматически при первом запуске.

### Структура таблиц

**mentors**:
- id (PK)
- full_name
- email (unique)
- phone
- specialization
- hourly_rate
- start_date
- status
- created_at
- updated_at
- и др.

**work_records**:
- id (PK)
- mentor_id (FK → mentors.id)
- date
- hours
- description
- category
- status
- created_at
- updated_at

### Переход на PostgreSQL

В `.env` измените:
```
DATABASE_URL=postgresql://user:password@localhost/mentor_system
```

И установите драйвер:
```bash
pip install psycopg2-binary
```

## Конфигурация

Конфигурация в файле `.env`:

```env
# Database
DATABASE_URL=sqlite:///./mentor_system.db

# API
API_HOST=0.0.0.0
API_PORT=8001
API_RELOAD=True

# CORS
CORS_ORIGINS=http://localhost:8000,http://127.0.0.1:8000

# App
APP_NAME="Mentor System API"
APP_VERSION="1.0.0"
DEBUG=True
```

## Разработка

### Структура проекта

```
backend/
├── core/                    # Ядро
│   ├── app.py              # FastAPI приложение
│   ├── config.py           # Конфигурация
│   └── database.py         # Подключение к БД
├── modules/                 # Модули
│   ├── mentors/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   └── work_records/
│       ├── domain/
│       ├── application/
│       ├── infrastructure/
│       └── presentation/
├── main.py                 # Точка входа
└── requirements.txt        # Зависимости
```

### Добавление нового модуля

1. Создайте структуру:
```
modules/new_module/
├── domain/
│   ├── entities/
│   └── repositories/
├── application/
│   ├── dto/
│   └── use_cases/
├── infrastructure/
│   ├── database/
│   └── repositories/
└── presentation/
    └── api/
```

2. Зарегистрируйте роутер в `core/app.py`:
```python
from modules.new_module.presentation.api.routes import router as new_router
app.include_router(new_router, prefix="/api/new", tags=["New"])
```

## Тестирование

### Ручное тестирование

Используйте Swagger UI: http://localhost:8001/docs

### Unit тесты (TODO)

```bash
pytest
```

## Production

### Gunicorn

```bash
pip install gunicorn
gunicorn core.app:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Docker

```bash
# Будет добавлен Dockerfile
```

## CORS

API настроен на работу с frontend на:
- http://localhost:8000
- http://127.0.0.1:8000

Для изменения измените `CORS_ORIGINS` в `.env`

## Лицензия

MIT

---

**Версия**: 1.0.0  
**Дата**: 31.10.2025

