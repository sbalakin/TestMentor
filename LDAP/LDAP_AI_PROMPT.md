# Промпт для ИИ: Создание LDAP интеграции

Данный промпт предназначен для использования с ИИ-ассистентами (ChatGPT, Claude, Gemini и т.д.) для генерации кода LDAP интеграции на любом языке программирования.

---

## Промпт для ИИ

```
Создай полную интеграцию LDAP аутентификации для [ЯЗЫК ПРОГРАММИРОВАНИЯ] приложения на основе следующей архитектуры и требований:

## Контекст проекта
- Язык: [ЯЗЫК ПРОГРАММИРОВАНИЯ]
- Фреймворк: [ФРЕЙМВОРК, например: FastAPI, Express.js, Spring Boot, Django, Rails]
- База данных: [БД, например: PostgreSQL, MySQL, MongoDB]
- Структура: [МОНОЛИТ/МИКРОСЕРВИСЫ]

## Архитектура решения

### Компоненты системы:

1. **LDAP Сервис**
   - Класс/модуль для работы с LDAP сервером
   - Методы:
     * Создание подключения к LDAP серверу
     * Получение служебного подключения (для поиска пользователей с учетными данными сервисного аккаунта)
     * Поиск пользователя по email в LDAP
     * Аутентификация пользователя (проверка пароля через bind с DN пользователя)

2. **LDAP Обработчик Авторизации**
   - Обработчик бизнес-логики LDAP авторизации
   - Методы:
     * LDAP логин: принимает email, password, company_slug (опционально)
     * Проверка учетных данных в LDAP
     * Поиск/создание пользователя в локальной БД
     * Генерация JWT токена (или другого механизма авторизации)
     * Обновление времени последнего входа

3. **Маппер ролей (опционально)**
   - Маппинг должностей из LDAP на роли в системе
   - Настраиваемые правила: ключевые слова, точные совпадения

4. **API эндпоинт**
   - POST endpoint для LDAP авторизации
   - Принимает: email, password, company_slug (опционально)
   - Возвращает: JWT токен, информация о пользователе и компании

## Технические требования

### LDAP подключение:
- Поддержка SSL/TLS
- Настраиваемые параметры: host, port, base DN, bind DN, bind password
- Обработка ошибок подключения
- Логирование всех операций

### Поиск пользователя:
- Поиск по email (атрибут mail)
- Фильтр поиска: (mail={email})
- Извлекаемые атрибуты: dn, uid, cn, mail, displayName, description
- Проверка на уникальность результата (должен быть один пользователь)

### Аутентификация:
- Поиск пользователя по email
- Попытка bind с найденным DN и паролем
- Обработка ошибок: неверный пароль, пользователь не найден, ошибки LDAP

### Интеграция с БД:
- Поиск существующего пользователя по email и company_id
- Создание нового пользователя если не найден:
  * Использование email как логин
  * Пустой пароль (LDAP пользователи не имеют локального пароля)
  * Данные из LDAP: full_name из displayName или cn, email, role
- Обновление времени последнего входа

### Настройки (конфигурация):
```
LDAP_HOST=ldap.example.com
LDAP_PORT=636
LDAP_USE_SSL=true
LDAP_BIND_DN=cn=admin,dc=example,dc=com
LDAP_BIND_PASSWORD=password
LDAP_BASE_DN=dc=example,dc=com
LDAP_CONNECTION_TIMEOUT=10000
```

## Требования к коду

### Обработка ошибок:
- Все ошибки LDAP должны логироваться
- HTTP ошибки для пользователя: 400 (неверные данные), 503 (LDAP недоступен), 500 (внутренние ошибки)
- Детальные логи для отладки

### Безопасность:
- Пароли LDAP пользователей НЕ сохраняются в локальной БД
- Все пароли передаются только в LDAP
- Использование SSL для подключения к LDAP

### Логирование:
- Успешные подключения
- Попытки авторизации
- Ошибки с полным контекстом
- Найденные/созданные пользователи

## Поток работы LDAP авторизации:

1. Пользователь отправляет email и password на /auth/ldap/login/{company_slug}
2. Система ищет пользователя в LDAP по email
3. Система пытается аутентифицироваться с найденным DN и паролем
4. При успехе:
   - Ищет/создает пользователя в локальной БД
   - Определяет компанию по company_slug
   - Определяет роль пользователя (из должности в LDAP или по умолчанию)
   - Генерирует JWT токен с данными: user_id, login, role, company_id, permissions
   - Обновляет время последнего входа
   - Возвращает токен и информацию о пользователе

## Адаптация под LDAP сервер:

### Active Directory:
- Search filter: (mail={email}) или (userPrincipalName={email})
- Атрибуты: mail, displayName, title, department
- Поле должности: title или description

### OpenLDAP:
- Search filter: (mail={email}) или (uid={email})
- Атрибуты: uid, cn, mail, description, givenName, sn
- Поле должности: description или title

## Дополнительные требования:

1. Код должен следовать best practices для [ЯЗЫК ПРОГРАММИРОВАНИЯ]
2. Использовать существующие библиотеки LDAP для [ЯЗЫК ПРОГРАММИРОВАНИЯ]
3. Структура должна быть модульной и расширяемой
4. Включить примеры использования API
5. Добавить комментарии и документацию к коду

## Примеры использования:

### Запрос:
POST /api/auth/ldap/login/company-slug
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "user_password"
}

### Ответ (успех):
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "company": {
    "company_id": 1,
    "company_name": "Example Company",
    "company_slug": "company-slug"
  },
  "user": {
    "user_id": 123,
    "login": "user@example.com",
    "full_name": "John Doe",
    "email": "user@example.com",
    "role": "user",
    "role_permissions": ["read:surveys", "read:interviews"]
  },
  "is_ldap_user": true
}

### Ответ (ошибка):
{
  "error": "Неверный email или пароль"
}

## Файлы для создания:

1. [LDAP_SERVICE_FILE] - сервис для работы с LDAP
2. [LDAP_HANDLER_FILE] - обработчик LDAP авторизации
3. [LDAP_ROLE_MAPPER_FILE] - маппер ролей (опционально)
4. [LDAP_CONFIG_FILE] - настройки LDAP
5. [LDAP_ROUTER_FILE] - API роутер/контроллер
6. [LDAP_MODELS_FILE] - модели данных (DTO)

Создай полный, рабочий код для всех этих компонентов на [ЯЗЫК ПРОГРАММИРОВАНИЯ] с учетом всех требований выше.
```

---

## Варианты использования промпта

### Для FastAPI (Python)

Замените в промпте:
- `[ЯЗЫК ПРОГРАММИРОВАНИЯ]` → `Python`
- `[ФРЕЙМВОРК]` → `FastAPI`
- `[БД]` → `PostgreSQL`
- `[LDAP_SERVICE_FILE]` → `src/services/ldap/ldap_service.py`
- `[LDAP_HANDLER_FILE]` → `src/api/routers/auth/handlers.py`
- `[LDAP_ROLE_MAPPER_FILE]` → `src/services/ldap/ldap_role_mapper.py`
- `[LDAP_CONFIG_FILE]` → `src/config/settings.py`
- `[LDAP_ROUTER_FILE]` → `src/api/routers/auth/router.py`
- `[LDAP_MODELS_FILE]` → `src/api/routers/auth/models.py`

### Для Express.js (Node.js)

Замените в промпте:
- `[ЯЗЫК ПРОГРАММИРОВАНИЯ]` → `JavaScript/TypeScript`
- `[ФРЕЙМВОРК]` → `Express.js`
- `[БД]` → `PostgreSQL` (или другая)
- `[LDAP_SERVICE_FILE]` → `src/services/ldapService.ts`
- `[LDAP_HANDLER_FILE]` → `src/controllers/authController.ts`
- `[LDAP_ROLE_MAPPER_FILE]` → `src/services/ldapRoleMapper.ts`
- `[LDAP_CONFIG_FILE]` → `src/config/ldapConfig.ts`
- `[LDAP_ROUTER_FILE]` → `src/routes/authRoutes.ts`
- `[LDAP_MODELS_FILE]` → `src/models/authModels.ts`

### Для Spring Boot (Java)

Замените в промпте:
- `[ЯЗЫК ПРОГРАММИРОВАНИЯ]` → `Java`
- `[ФРЕЙМВОРК]` → `Spring Boot`
- `[БД]` → `PostgreSQL` (или другая)
- `[LDAP_SERVICE_FILE]` → `com/example/service/LdapService.java`
- `[LDAP_HANDLER_FILE]` → `com/example/controller/AuthController.java`
- `[LDAP_ROLE_MAPPER_FILE]` → `com/example/service/LdapRoleMapper.java`
- `[LDAP_CONFIG_FILE]` → `application.properties` или `application.yml`
- `[LDAP_ROUTER_FILE]` → `com/example/controller/AuthController.java`
- `[LDAP_MODELS_FILE]` → `com/example/model/` (DTO классы)

### Для Django (Python)

Замените в промпте:
- `[ЯЗЫК ПРОГРАММИРОВАНИЯ]` → `Python`
- `[ФРЕЙМВОРК]` → `Django`
- `[БД]` → `PostgreSQL` (или другая)
- `[LDAP_SERVICE_FILE]` → `apps/auth/services/ldap_service.py`
- `[LDAP_HANDLER_FILE]` → `apps/auth/views.py`
- `[LDAP_ROLE_MAPPER_FILE]` → `apps/auth/services/role_mapper.py`
- `[LDAP_CONFIG_FILE]` → `settings.py`
- `[LDAP_ROUTER_FILE]` → `apps/auth/urls.py`
- `[LDAP_MODELS_FILE]` → `apps/auth/serializers.py`

### Для Ruby on Rails

Замените в промпте:
- `[ЯЗЫК ПРОГРАММИРОВАНИЯ]` → `Ruby`
- `[ФРЕЙМВОРК]` → `Ruby on Rails`
- `[БД]` → `PostgreSQL` (или другая)
- `[LDAP_SERVICE_FILE]` → `app/services/ldap_service.rb`
- `[LDAP_HANDLER_FILE]` → `app/controllers/auth_controller.rb`
- `[LDAP_ROLE_MAPPER_FILE]` → `app/services/ldap_role_mapper.rb`
- `[LDAP_CONFIG_FILE]` → `config/application.rb` или `.env`
- `[LDAP_ROUTER_FILE]` → `config/routes.rb`
- `[LDAP_MODELS_FILE]` → `app/serializers/` или `app/controllers/`

---

## Расширенный промпт (с деталями)

Если нужно больше деталей, используйте расширенную версию:

```
[БАЗОВЫЙ ПРОМПТ ВЫШЕ]

## Дополнительные детали:

### Библиотеки для LDAP:
- Python: ldap3
- Node.js: ldapjs
- Java: Spring LDAP или Apache Directory LDAP API
- C#/.NET: System.DirectoryServices
- Go: go-ldap-client
- PHP: ldap extension

### Структура ошибок:
- 400 Bad Request: неверный email или пароль, компания не найдена
- 401 Unauthorized: неверные учетные данные
- 500 Internal Server Error: ошибки LDAP, ошибки БД
- 503 Service Unavailable: LDAP сервер недоступен

### Логирование должно включать:
- Уровень: INFO для успешных операций, WARNING для неудачных попыток, ERROR для ошибок
- Контекст: email пользователя, операция, результат
- Исключения: полный stack trace для ошибок

### Тестирование:
- Создай unit тесты для LDAP сервиса
- Создай integration тесты для полного потока авторизации
- Используй mock для LDAP подключения в тестах

### Безопасность:
- Валидация входных данных (email формат, длина пароля)
- Rate limiting для эндпоинта авторизации
- Защита от LDAP injection в search фильтрах
- Использование prepared statements для поиска

Создай также:
- README с инструкциями по настройке
- Примеры переменных окружения (.env.example)
- Docker compose конфигурацию для тестирования (опционально)
```

---

## Пример полного промпта для Python/FastAPI

```
Создай полную интеграцию LDAP аутентификации для Python приложения на FastAPI.

## Контекст проекта
- Язык: Python 3.11+
- Фреймворк: FastAPI
- База данных: PostgreSQL (asyncpg)
- Структура: Монолит с модульной архитектурой

[ОСТАЛЬНАЯ ЧАСТЬ ПРОМПТА ИЗ БАЗОВОЙ ВЕРСИИ]

## Библиотеки:
- ldap3>=2.9.1 для работы с LDAP
- python-dotenv для загрузки переменных окружения
- pydantic для валидации данных

## Структура проекта:
```
src/
├── services/
│   └── ldap/
│       ├── __init__.py
│       ├── ldap_service.py
│       └── ldap_role_mapper.py
├── api/
│   └── routers/
│       └── auth/
│           ├── router.py
│           ├── handlers.py
│           └── models.py
└── config/
    └── settings.py
```

Создай полный, рабочий код на Python с type hints, docstrings и обработкой ошибок.
```

---

## Советы по использованию

1. **Адаптируйте промпт** под ваш конкретный язык и фреймворк
2. **Добавьте контекст** вашего проекта (существующие паттерны, библиотеки)
3. **Укажите версии** библиотек, если это важно
4. **Добавьте примеры** существующего кода для поддержания стиля
5. **Попросите ИИ объяснить** сложные части кода после генерации

---

## После генерации кода

Проверьте сгенерированный код:
1. ✅ Все компоненты созданы
2. ✅ Обработка ошибок на месте
3. ✅ Логирование реализовано
4. ✅ Безопасность учтена
5. ✅ Документация добавлена
6. ✅ Код соответствует best practices языка

Затем:
- Протестируйте подключение к LDAP
- Проверьте авторизацию с реальными учетными данными
- Настройте переменные окружения
- Добавьте тесты

