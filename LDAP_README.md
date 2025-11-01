# LDAP Интеграция в KOI

## ✅ Интеграция завершена!

LDAP аутентификация успешно интегрирована в систему KOI. Теперь пользователи могут входить в систему используя корпоративные учетные данные из LDAP сервера `ldap.effective-mobile.ru`.

---

## 🎯 Что было сделано

### 1. Backend (FastAPI + Clean Architecture)

#### ✅ Зависимости
- Добавлена библиотека `ldap3==2.9.1` в `requirements.txt`

#### ✅ Конфигурация (`backend/core/config.py`)
Добавлены настройки LDAP:
```python
LDAP_HOST: str = "ldap.effective-mobile.ru"
LDAP_PORT: int = 636
LDAP_USE_SSL: bool = True
LDAP_BIND_DN: str = "uid=api,ou=service-accounts,dc=company,dc=com"
LDAP_BIND_PASSWORD: str = "XEXed3ZPf6rR"
LDAP_BASE_DN: str = "dc=company,dc=com"
LDAP_CONNECTION_TIMEOUT: int = 10000
```

#### ✅ LDAP Service (`backend/modules/auth/infrastructure/ldap_service.py`)
Реализован сервис для работы с LDAP:
- **Подключение к LDAP серверу** через SSL
- **Поиск пользователя по email** в LDAP
- **Аутентификация** пользователя (проверка пароля)
- **Обработка ошибок** и логирование

#### ✅ LDAP Login Use Case (`backend/modules/auth/application/use_cases/ldap_login.py`)
Реализован сценарий LDAP авторизации:
- Проверка учетных данных в LDAP
- Автоматическое создание пользователя в локальной БД (если не существует)
- Определение роли на основе должности из LDAP (Manager/Mentor)
- Генерация JWT токена

#### ✅ API Endpoint (`backend/modules/auth/presentation/api/routes.py`)
Добавлен эндпоинт:
```
POST /api/auth/ldap/login
```

**Запрос:**
```json
{
  "username": "user@example.com",  // Email из LDAP
  "password": "user_password"       // Пароль LDAP
}
```

**Ответ:**
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "user": {
    "id": "user-id",
    "username": "user",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "MANAGER",
    "mentor_id": null,
    "is_ldap_user": true
  }
}
```

---

### 2. Frontend (HTML/CSS/JavaScript)

#### ✅ Страница логина (`frontend/login.html`)
Добавлена кнопка **"🔐 Войти через LDAP"**:
- Зеленая кнопка с иконкой замка
- Автоматическая отправка запроса на `/api/auth/ldap/login`
- Валидация email и пароля
- Обработка ошибок с понятными сообщениями
- Редирект в соответствующее приложение (Admin Panel / Mentor Cabinet)

---

## 🚀 Как использовать

### Для пользователей

1. Откройте страницу входа: `http://localhost:8000/login.html`
2. Введите **корпоративный email** (из LDAP) в поле "Логин"
3. Введите **пароль LDAP** в поле "Пароль"
4. Нажмите кнопку **"🔐 Войти через LDAP"**

**Если это первый вход:**
- Система автоматически создаст вашу учетную запись
- Роль определится на основе должности в LDAP:
  - Должность содержит "manager", "руководитель", "директор" → роль **MANAGER**
  - Остальные → роль **MENTOR**

**При повторных входах:**
- Система найдет существующего пользователя по email
- Проверит пароль в LDAP
- Вернет JWT токен

---

## 📊 Архитектура

### Поток авторизации

```
┌─────────────┐
│   Frontend  │
│ (login.html)│
└──────┬──────┘
       │ POST /api/auth/ldap/login
       │ { username, password }
       ▼
┌──────────────────────┐
│ FastAPI Endpoint     │
│ /api/auth/ldap/login │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ LdapLoginUseCase     │
│ (Application Layer)  │
└──────┬───────────────┘
       │
   ┌───┴────┐
   │        │
   ▼        ▼
┌────────┐ ┌──────────────┐
│ LDAP   │ │ User         │
│Service │ │ Repository   │
└────┬───┘ └──────┬───────┘
     │            │
     ▼            ▼
┌─────────┐  ┌──────────┐
│  LDAP   │  │ Database │
│ Server  │  │ (SQLite) │
└─────────┘  └──────────┘
```

### Слои приложения (Clean Architecture)

1. **Domain Layer** (`domain/`)
   - `entities/user.py` - сущность пользователя

2. **Application Layer** (`application/`)
   - `use_cases/ldap_login.py` - сценарий LDAP логина
   - `dto/auth_dto.py` - объекты передачи данных

3. **Infrastructure Layer** (`infrastructure/`)
   - `ldap_service.py` - LDAP сервис (новый!)
   - `repositories/user_repository.py` - репозиторий пользователей
   - `security.py` - JWT токены

4. **Presentation Layer** (`presentation/`)
   - `api/routes.py` - API эндпоинты

---

## 🔒 Безопасность

### Что учтено:

✅ **Пароли LDAP НЕ сохраняются** в локальной БД
- Пользователи, созданные через LDAP, имеют пустой пароль в БД
- Аутентификация всегда происходит через LDAP сервер

✅ **SSL/TLS соединение** с LDAP сервером (порт 636)

✅ **Служебная учетная запись** для поиска пользователей:
- `uid=api,ou=service-accounts,dc=company,dc=com`
- Используется только для поиска, не для аутентификации

✅ **JWT токены** для API доступа
- Токен создается только после успешной LDAP аутентификации

✅ **Обработка ошибок** без раскрытия внутренней информации

---

## 🛠 Настройки

### Переменные окружения (`.env`)

Вы можете переопределить LDAP настройки через `.env` файл:

```env
# LDAP настройки
LDAP_HOST=ldap.effective-mobile.ru
LDAP_PORT=636
LDAP_USE_SSL=True
LDAP_BIND_DN=uid=api,ou=service-accounts,dc=company,dc=com
LDAP_BIND_PASSWORD=XEXed3ZPf6rR
LDAP_BASE_DN=dc=company,dc=com
LDAP_CONNECTION_TIMEOUT=10000
```

---

## 🧪 Тестирование

### Swagger UI

Протестировать LDAP эндпоинт можно через Swagger UI:

1. Откройте: `http://localhost:8001/docs`
2. Найдите эндпоинт `POST /api/auth/ldap/login`
3. Нажмите "Try it out"
4. Введите данные:
   ```json
   {
     "username": "your-email@company.com",
     "password": "your-ldap-password"
   }
   ```
5. Нажмите "Execute"

### Curl

```bash
curl -X POST "http://localhost:8001/api/auth/ldap/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your-email@company.com",
    "password": "your-ldap-password"
  }'
```

---

## 📝 Логирование

Все операции LDAP логируются с префиксом `[LDAP]`:

```
[LDAP] Успешное подключение к LDAP серверу ldap.effective-mobile.ru
[LDAP] Найден пользователь в LDAP: user@company.com
[LDAP] Успешная LDAP аутентификация для пользователя: user@company.com
[LdapLoginUseCase] Попытка LDAP авторизации: user@company.com
[LdapLoginUseCase] Создан новый LDAP пользователь: user@company.com (role=MENTOR)
```

---

## 🔍 Отладка

### Проблема: "LDAP сервер недоступен"

**Причины:**
- LDAP сервер выключен или недоступен из сети
- Неверные настройки `LDAP_HOST` или `LDAP_PORT`
- Firewall блокирует порт 636

**Решение:**
1. Проверьте доступность LDAP сервера:
   ```bash
   telnet ldap.effective-mobile.ru 636
   ```
2. Проверьте настройки в `backend/core/config.py`

### Проблема: "Неверные учетные данные LDAP"

**Причины:**
- Неверный email или пароль
- Пользователь не существует в LDAP
- Неверный формат email

**Решение:**
1. Проверьте, что используете корпоративный email из LDAP
2. Проверьте пароль
3. Убедитесь, что пользователь существует в LDAP

### Проблема: "Найдено несколько пользователей"

**Причины:**
- В LDAP несколько пользователей с одинаковым email

**Решение:**
- Обратитесь к администратору LDAP для исправления дубликатов

---

## 🎨 UI/UX

### Страница логина

**Дизайн:**
- Основная кнопка "Войти" (фиолетовая) - для локального логина
- Кнопка "🔐 Войти через LDAP" (зеленая) - для LDAP логина
- Подсказки о способах входа

**Поведение:**
- При клике на LDAP кнопку отправляется запрос на `/api/auth/ldap/login`
- Показывается индикатор загрузки "LDAP авторизация..."
- При успехе - редирект в Admin Panel или Mentor Cabinet
- При ошибке - понятное сообщение об ошибке

---

## 📦 Файлы проекта

### Backend
```
backend/
├── core/
│   └── config.py                           # ✅ LDAP настройки
├── modules/
│   └── auth/
│       ├── application/
│       │   └── use_cases/
│       │       └── ldap_login.py           # ✅ LDAP Login Use Case
│       ├── infrastructure/
│       │   └── ldap_service.py             # ✅ LDAP Service
│       └── presentation/
│           └── api/
│               └── routes.py               # ✅ LDAP эндпоинт
└── requirements.txt                        # ✅ ldap3==2.9.1
```

### Frontend
```
frontend/
└── login.html                              # ✅ LDAP кнопка
```

---

## ✨ Возможности для расширения

### 1. Синхронизация пользователей
Создать задачу для периодической синхронизации всех пользователей из LDAP:
```python
async def sync_all_users_from_ldap():
    """Синхронизация всех пользователей из LDAP"""
    # Получить всех пользователей из LDAP
    # Обновить или создать в локальной БД
```

### 2. Обновление данных при входе
При каждом входе обновлять данные пользователя из LDAP:
```python
# В LdapLoginUseCase.execute()
if user:
    # Обновляем full_name, должность и т.д. из LDAP
    user.full_name = ldap_user.get("displayName")
    db.commit()
```

### 3. Продвинутый маппинг ролей
Создать отдельный сервис для маппинга должностей на роли:
```python
class LdapRoleMapper:
    """Маппинг должностей из LDAP на роли в системе"""
    
    ROLE_MAPPINGS = {
        UserRole.MANAGER: {
            "keywords": ["manager", "руководитель"],
            "exact_matches": ["boss", "director"],
        },
        # ...
    }
```

### 4. Мультитенантность (Multi-company)
Если в будущем появится поддержка нескольких компаний:
```python
# Добавить company_slug в эндпоинт
POST /api/auth/ldap/login/{company_slug}
```

---

## 📚 Дополнительные ресурсы

- [ldap3 Documentation](https://ldap3.readthedocs.io/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [LDAP Protocol (RFC 4511)](https://tools.ietf.org/html/rfc4511)
- [Active Directory LDAP](https://docs.microsoft.com/en-us/previous-versions/windows/desktop/ldap/active-directory-ldap-classes)

---

## ✅ Чеклист интеграции

- [x] Установлена библиотека ldap3
- [x] Добавлены LDAP настройки в конфигурацию
- [x] Реализован LDAP сервис
- [x] Создан LDAP Login Use Case
- [x] Добавлен API эндпоинт
- [x] Обновлен frontend с кнопкой LDAP
- [x] Добавлено логирование
- [x] Обработка ошибок
- [x] Безопасность (SSL, пароли не сохраняются)
- [x] Документация

---

## 🎉 Готово!

LDAP интеграция полностью завершена и готова к использованию!

**Теперь пользователи могут:**
- Входить в систему используя корпоративные учетные данные
- Автоматически создавать учетные записи при первом входе
- Использовать единую точку входа (Single Sign-On)

**Администраторы могут:**
- Управлять доступом пользователей через LDAP
- Не беспокоиться о синхронизации паролей
- Централизованно управлять ролями

---

*Дата создания: 2024-11-01*  
*Автор: AI Assistant*  
*Проект: KOI - Система управления менторами*


