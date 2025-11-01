# Инструкция по интеграции LDAP аутентификации

Данная инструкция описывает процесс интеграции LDAP (Lightweight Directory Access Protocol) аутентификации в FastAPI приложение на примере проекта Interview Bot API. Инструкция написана так, чтобы её можно было использовать как в текущем проекте, так и для интеграции в другие проекты.

## Содержание

1. [Обзор](#обзор)
2. [Архитектура решения](#архитектура-решения)
3. [Пошаговая интеграция](#пошаговая-интеграция)
4. [Настройка конфигурации](#настройка-конфигурации)
5. [Использование](#использование)
6. [Примеры кода из проекта](#примеры-кода-из-проекта)

---

## Обзор

LDAP интеграция позволяет использовать существующие учетные записи из корпоративного LDAP-сервера (например, Active Directory) для аутентификации пользователей в вашем приложении. Основные преимущества:

- **Единая точка входа**: Пользователи используют те же учетные данные, что и для доступа к корпоративным системам
- **Централизованное управление**: Администратор управляет доступом через LDAP
- **Безопасность**: Пароли хранятся в LDAP, а не в локальной БД
- **Синхронизация**: Данные пользователей (имя, email, должность) автоматически синхронизируются из LDAP

### Как это работает

1. Пользователь вводит email и пароль
2. Приложение ищет пользователя в LDAP по email
3. Приложение пытается аутентифицироваться с найденным DN и паролем
4. При успешной аутентификации создается или обновляется запись в локальной БД
5. Генерируется JWT токен для доступа к API

---

## Архитектура решения

### Компоненты системы

```
┌─────────────────┐
│  FastAPI Router │  ← Точка входа (эндпоинт)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ LdapAuthHandler │  ← Бизнес-логика авторизации
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌──────────┐ ┌─────────────┐
│LdapService│ │AuthService  │  ← Сервисы
└──────────┘ └─────────────┘
    │              │
    ▼              ▼
┌──────────┐  ┌──────────┐
│   LDAP   │  │Database  │  ← Внешние системы
└──────────┘  └──────────┘
```

### Основные классы

1. **`LdapService`** (`src/services/ldap/ldap_service.py`)
   - Подключение к LDAP серверу
   - Поиск пользователей
   - Аутентификация пользователей

2. **`LdapAuthHandler`** (`src/api/routers/auth/handlers.py`)
   - Обработка запросов на LDAP авторизацию
   - Создание/обновление записей пользователей в БД
   - Генерация JWT токенов

3. **`LdapRoleMapper`** (`src/services/ldap/ldap_role_mapper.py`)
   - Маппинг должностей из LDAP на роли в системе

---

## Пошаговая интеграция

### Шаг 1: Установка зависимостей

Добавьте библиотеку `ldap3` в ваш `requirements.txt` или `pyproject.toml`:

```bash
pip install ldap3
```

Или добавьте в `requirements.txt`:

```
ldap3>=2.9.1
```

### Шаг 2: Создание настроек LDAP

Добавьте класс настроек LDAP в ваш файл настроек (например, `config/settings.py`):

```python
from dataclasses import dataclass

@dataclass
class LdapSettings:
    """Настройки для LDAP."""
    
    LDAP_HOST: str
    LDAP_PORT: int
    LDAP_BIND_DN: str
    LDAP_BIND_PASSWORD: str
    LDAP_BASE_DN: str
    LDAP_CONNECTION_TIMEOUT: int = 10000
    LDAP_USE_SSL: bool = True
```

Добавьте настройки LDAP в основной класс `Settings`:

```python
@dataclass
class Settings:
    # ... другие настройки ...
    
    # Настройки LDAP
    ldap: LdapSettings
    
    @classmethod
    def from_env(cls) -> "Settings":
        # ... существующий код ...
        
        ldap_settings = LdapSettings(
            LDAP_HOST=os.getenv("LDAP_HOST"),
            LDAP_PORT=int(os.getenv("LDAP_PORT", "636")),
            LDAP_BIND_DN=os.getenv("LDAP_BIND_DN"),
            LDAP_BIND_PASSWORD=os.getenv("LDAP_BIND_PASSWORD"),
            LDAP_BASE_DN=os.getenv("LDAP_BASE_DN"),
            LDAP_CONNECTION_TIMEOUT=int(os.getenv("LDAP_CONNECTION_TIMEOUT", "10000")),
            LDAP_USE_SSL=os.getenv("LDAP_USE_SSL", "True") == "True",
        )
        
        return cls(
            # ... другие настройки ...
            ldap=ldap_settings,
        )
```

### Шаг 3: Создание LDAP сервиса

Создайте файл `src/services/ldap/ldap_service.py`:

```python
"""Сервис для работы с LDAP."""

from typing import Any

from fastapi import HTTPException, status
from ldap3 import ALL, Connection, Server
from ldap3.core.exceptions import (
    LDAPBindError,
    LDAPException,
    LDAPInvalidCredentialsResult,
)

from config.settings import LdapSettings, Settings
from services.logger_service import get_logger


logger = get_logger(__name__)
settings = Settings.from_env()
ldap_settings = settings.ldap


class LdapService:
    """Сервис для работы с LDAP."""

    def __init__(self):
        """Инициализация сервиса."""
        self.ldap_settings = ldap_settings

    def _create_server(self) -> Server:
        """
        Создание LDAP сервера.

        Returns:
            Server: LDAP сервер
        """
        return Server(
            self.ldap_settings.LDAP_HOST,
            port=self.ldap_settings.LDAP_PORT,
            use_ssl=self.ldap_settings.LDAP_USE_SSL,
            get_info=ALL,
        )

    def _get_service_connection(self) -> Connection:
        """
        Получение служебного подключения к LDAP (для поиска пользователей).

        Returns:
            Connection: LDAP соединение

        Raises:
            HTTPException: При ошибке подключения
        """
        try:
            server = self._create_server()
            conn = Connection(
                server,
                user=self.ldap_settings.LDAP_BIND_DN,
                password=self.ldap_settings.LDAP_BIND_PASSWORD,
                auto_bind=True,
            )
            logger.info("Успешное подключение к LDAP серверу")
            return conn
        except LDAPException as e:
            logger.error(f"Ошибка подключения к LDAP серверу: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="LDAP сервер недоступен",
            ) from e

    def find_user_by_email(self, email: str) -> dict[str, Any] | None:
        """
        Поиск пользователя в LDAP по email.

        Args:
            email: Email пользователя

        Returns:
            Dict с данными пользователя или None если не найден

        Raises:
            HTTPException: При ошибках работы с LDAP
        """
        try:
            conn = self._get_service_connection()

            # Поиск пользователя по email
            # Адаптируйте search_filter под вашу LDAP структуру
            search_filter = f"(mail={email})"
            conn.search(
                search_base=self.ldap_settings.LDAP_BASE_DN,
                search_filter=search_filter,
                attributes=["uid", "cn", "mail", "description", "displayName"],
            )

            if len(conn.entries) == 0:
                logger.warning(f"Пользователь с email {email} не найден в LDAP")
                return None

            if len(conn.entries) > 1:
                logger.error(f"Найдено несколько пользователей с email {email}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Найдено несколько пользователей с таким email",
                )

            entry = conn.entries[0]
            user_data = {
                "dn": entry.entry_dn,
                "uid": str(entry.uid) if hasattr(entry, "uid") else None,
                "cn": str(entry.cn) if hasattr(entry, "cn") else None,
                "mail": str(entry.mail) if hasattr(entry, "mail") else None,
                "displayName": str(entry.displayName) if hasattr(entry, "displayName") else str(entry.cn) if hasattr(entry, "cn") else None,
                "description": str(entry.description) if hasattr(entry, "description") else None,
            }

            logger.info(f"Найден пользователь в LDAP: {user_data}")
            conn.unbind()
            return user_data

        except HTTPException:
            raise
        except LDAPException as e:
            logger.error(f"LDAP ошибка при поиске пользователя {email}: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка работы с LDAP: {str(e)}",
            )

    def authenticate_user(self, email: str, password: str) -> dict[str, Any] | None:
        """
        Аутентификация пользователя в LDAP.

        Args:
            email: Email пользователя
            password: Пароль пользователя

        Returns:
            Dict с данными пользователя если аутентификация успешна, иначе None

        Raises:
            HTTPException: При ошибках работы с LDAP
        """
        if not password:
            logger.warning(f"Попытка аутентификации с пустым паролем для {email}")
            return None

        # Сначала находим пользователя
        user_data = self.find_user_by_email(email)

        if not user_data or not user_data.get("dn"):
            logger.warning(f"Пользователь {email} не найден в LDAP")
            return None

        # Пытаемся аутентифицироваться с найденным DN
        try:
            server = self._create_server()
            conn = Connection(
                server,
                user=user_data["dn"],
                password=password,
                auto_bind=True,
            )

            logger.info(f"Успешная LDAP аутентификация для пользователя: {email}")
            conn.unbind()
            return user_data

        except (LDAPBindError, LDAPInvalidCredentialsResult):
            logger.warning(f"Неверный пароль для пользователя {email}")
            return None
        except LDAPException as e:
            logger.error(f"LDAP ошибка при аутентификации пользователя {email}: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка работы с LDAP: {str(e)}",
            ) from e
```

**Важно**: Адаптируйте метод `find_user_by_email` под структуру вашего LDAP:
- Измените `search_filter` если используете другое поле для поиска
- Измените список `attributes` под атрибуты вашего LDAP
- Адаптируйте извлечение данных из `entry` под вашу схему LDAP

### Шаг 4: Создание маппера ролей (опционально)

Если вы хотите автоматически назначать роли пользователям на основе их должности из LDAP, создайте `src/services/ldap/ldap_role_mapper.py`:

```python
"""Маппинг должностей из LDAP на роли в системе."""

from core.permissions.enums import EmployeeRole  # Адаптируйте под вашу систему ролей
from services.logger_service import get_logger


logger = get_logger(__name__)


class LdapRoleMapper:
    """
    Класс для определения роли пользователя на основе должности из LDAP.
    
    Адаптируйте ROLE_MAPPINGS под ваши роли и должности.
    """

    ROLE_MAPPINGS = {
        EmployeeRole.MENTOR: {
            "keywords": ["mentor"],  # Ключевые слова в должности
            "exact_matches": [],
        },
        EmployeeRole.ADMIN: {
            "keywords": [],
            "exact_matches": ["boss", "chief accountant"],
        },
        EmployeeRole.HR: {
            "keywords": [],
            "exact_matches": ["research manager", "cv manager", "manager", "recruiter"],
        },
    }

    DEFAULT_ROLE = EmployeeRole.USER

    @classmethod
    def get_role_from_position(cls, position: str | None) -> str:
        """
        Определяет роль пользователя на основе должности из LDAP.

        Args:
            position: Должность из LDAP (поле description)

        Returns:
            str: Роль пользователя
        """
        if not position or not isinstance(position, str):
            return cls.DEFAULT_ROLE.value

        position_lower = position.strip().lower()

        for role, config in cls.ROLE_MAPPINGS.items():
            for keyword in config["keywords"]:
                if keyword.lower() in position_lower:
                    return role.value

            for exact_match in config["exact_matches"]:
                if position_lower == exact_match.lower():
                    return role.value

        return cls.DEFAULT_ROLE.value
```

### Шаг 5: Создание обработчика LDAP авторизации

Создайте обработчик в `src/api/routers/auth/handlers.py` (или добавьте к существующему):

```python
from services.ldap import LdapService, LdapRoleMapper  # Если используете маппер
from database import DatabaseManager
from services.logger_service import get_logger

logger = get_logger(__name__)


class LdapAuthHandler:
    """Обработчик запросов, связанных с LDAP авторизацией."""

    def __init__(self, db_manager: DatabaseManager):
        """Инициализация обработчика."""
        self.db_manager = db_manager
        self.ldap_service = LdapService()
        self.role_mapper = LdapRoleMapper()  # Если используете
        self.auth_service = AuthService(db_manager)  # Ваш сервис для JWT

    async def ldap_login(
        self, 
        email: str, 
        password: str, 
        company_slug: str | None = None
    ) -> dict[str, Any]:
        """
        Авторизация пользователя через LDAP.

        Args:
            email: Email пользователя LDAP
            password: Пароль пользователя
            company_slug: Slug компании для входа (опционально)

        Returns:
            Результат операции с токеном и данными пользователя
        """
        logger.info(f"Попытка LDAP авторизации пользователя: {email}")

        try:
            # 1. Проверяем учетные данные в LDAP
            ldap_user = self.ldap_service.authenticate_user(email, password)
            if not ldap_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={"error": "Неверный email или пароль"}
                )

            # 2. Определяем компанию (адаптируйте под вашу логику мультитенантности)
            company = None
            if company_slug:
                company = await self.db_manager.company_repository.get_company_by_slug(company_slug)
                if not company:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail={"error": f"Компания с slug '{company_slug}' не найдена"}
                    )
            else:
                # Логика получения компании по умолчанию
                companies = await self.db_manager.company_repository.get_all_companies()
                if companies:
                    company = companies[0]
                else:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail={"error": "Не найдено ни одной компании"}
                    )

            # 3. Ищем или создаем сотрудника в указанной компании
            employee = await self.db_manager.employee_repository.get_employee_by_email_and_company(
                email, company["id"]
            )

            if not employee:
                # Определяем роль из должности (если используете маппер)
                position = ldap_user.get("description")
                role = self.role_mapper.get_role_from_position(position) if position else "user"

                # Создаем нового сотрудника на основе LDAP данных
                employee = await self.db_manager.employee_repository.create_employee(
                    company_id=company["id"],
                    login=email,  # Используем email как логин
                    password="",  # LDAP пользователи не имеют локального пароля
                    full_name=ldap_user.get("displayName") or ldap_user.get("cn", ""),
                    email=email,
                    role=role,
                )
                logger.info(f"Создан новый LDAP сотрудник: {email}")

            # 4. Получаем разрешения роли (адаптируйте под вашу систему)
            role_permissions = self._get_role_permissions(employee.get("role", "user"))

            # 5. Создаем данные для JWT токена
            token_data = {
                "user_id": employee["id"],
                "login": employee["login"],
                "role": employee.get("role", "user"),
                "company_id": company["id"],
                "company_slug": company["slug"],
                "role_permissions": role_permissions,
                # Добавьте другие поля по необходимости
            }

            access_token = self.auth_service.create_access_token(data=token_data)

            # 6. Обновляем время последнего входа
            await self.db_manager.auth_repository.update_last_login(employee["id"])

            return {
                "access_token": access_token,
                "token_type": "bearer",
                "company": {
                    "company_id": company["id"],
                    "company_name": company["name"],
                    "company_slug": company["slug"],
                },
                "user": {
                    "user_id": employee["id"],
                    "login": employee["login"],
                    "full_name": employee["full_name"],
                    "email": employee["email"],
                    "role": employee.get("role", "user"),
                    "role_permissions": role_permissions,
                },
                "is_ldap_user": True,
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Ошибка при LDAP авторизации: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"error": f"Внутренняя ошибка сервера: {str(e)}"}
            ) from e
```

### Шаг 6: Создание API эндпоинта

Добавьте эндпоинт в ваш роутер (например, `src/api/routers/auth/router.py`):

```python
from fastapi import APIRouter, Depends
from database import DatabaseManager, get_db_manager
from .handlers import LdapAuthHandler
from .models import LdapLoginRequestWithoutSlug, LdapLoginResponse

router = APIRouter(tags=["auth"])


@router.post("/ldap/login/{company_slug}", response_model=LdapLoginResponse)
async def ldap_login(
    company_slug: str,
    login_data: LdapLoginRequestWithoutSlug,
    db_manager: DatabaseManager = Depends(get_db_manager),
):
    """
    Авторизация пользователя через LDAP.

    Args:
        company_slug: Slug компании из URL
        login_data: Данные для входа (email, пароль)
        db_manager: Менеджер базы данных

    Returns:
        LdapLoginResponse: JWT токен и информация о пользователе из LDAP
    """
    handler = LdapAuthHandler(db_manager)
    result = await handler.ldap_login(
        login_data.email, 
        login_data.password, 
        company_slug
    )
    return LdapLoginResponse(**result)
```

### Шаг 7: Создание моделей Pydantic

Создайте модели запроса и ответа в `src/api/routers/auth/models.py`:

```python
from pydantic import BaseModel, Field


class LdapLoginRequestWithoutSlug(BaseModel):
    """Модель запроса для LDAP авторизации без company_slug."""

    email: str = Field(
        ..., min_length=1, max_length=255, description="Email пользователя в LDAP"
    )
    password: str = Field(
        ..., min_length=1, max_length=255, description="Пароль пользователя"
    )


class CompanyInfo(BaseModel):
    """Информация о компании."""
    
    company_id: int = Field(..., description="ID компании")
    company_name: str = Field(..., description="Название компании")
    company_slug: str = Field(..., description="Slug компании")


class UserInfo(BaseModel):
    """Информация о пользователе."""
    
    user_id: int = Field(..., description="ID сотрудника")
    login: str | None = Field(None, description="Логин сотрудника")
    full_name: str | None = Field(None, description="Полное имя сотрудника")
    email: str | None = Field(None, description="Email сотрудника")
    role: str | None = Field(None, description="Роль сотрудника")
    role_permissions: list[str] = Field(default=[], description="Разрешения роли")


class LdapLoginResponse(BaseModel):
    """Модель ответа при успешной LDAP авторизации."""

    access_token: str = Field(..., description="JWT токен доступа")
    token_type: str = Field(default="bearer", description="Тип токена")
    company: CompanyInfo = Field(..., description="Информация о компании")
    user: UserInfo = Field(..., description="Информация о пользователе")
    is_ldap_user: bool = Field(default=True, description="Пользователь из LDAP")
```

### Шаг 8: Обновление репозитория (если необходимо)

Убедитесь, что в вашем `EmployeeRepository` есть метод для поиска сотрудника по email и компании:

```python
async def get_employee_by_email_and_company(
    self, email: str, company_id: int
) -> dict[str, Any] | None:
    """
    Получение сотрудника по email и компании.

    Args:
        email: Email сотрудника
        company_id: ID компании

    Returns:
        Данные сотрудника или None если не найден
    """
    query = """
        SELECT * FROM employee
        WHERE email = $1 AND company_id = $2
    """
    row = await self.fetch_one(query, email, company_id)
    return self._process_employee_row(row)
```

---

## Настройка конфигурации

### Переменные окружения

Добавьте следующие переменные в ваш `.env` файл:

```env
# LDAP настройки
LDAP_HOST=ldap.example.com          # Адрес LDAP сервера
LDAP_PORT=636                        # Порт LDAP сервера (636 для SSL, 389 для обычного)
LDAP_USE_SSL=True                    # Использовать SSL соединение
LDAP_BIND_DN=cn=admin,dc=example,dc=com  # DN служебной учетной записи для поиска
LDAP_BIND_PASSWORD=password          # Пароль служебной учетной записи
LDAP_BASE_DN=dc=example,dc=com      # Базовый DN для поиска пользователей
LDAP_CONNECTION_TIMEOUT=10000        # Таймаут подключения в миллисекундах
```

### Адаптация под ваш LDAP сервер

В зависимости от вашего LDAP сервера (Active Directory, OpenLDAP и т.д.), вам может потребоваться изменить:

1. **Search Filter** в методе `find_user_by_email`:
   - Active Directory: `(mail={email})` или `(userPrincipalName={email})`
   - OpenLDAP: `(mail={email})` или `(uid={email})`

2. **Атрибуты для поиска**:
   ```python
   attributes=["uid", "cn", "mail", "displayName", "description", "title"]
   ```

3. **Поле для отображения имени**:
   - Active Directory: `displayName` или `name`
   - OpenLDAP: `cn` или `givenName + sn`

4. **Поле для должности**:
   - Active Directory: `title` или `description`
   - OpenLDAP: `description` или `title`

---

## Использование

### Пример запроса

```bash
curl -X POST "http://localhost:8000/api/auth/ldap/login/company-slug" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "user_password"
  }'
```

### Пример ответа

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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
```

### Использование токена

После получения токена, используйте его в заголовке `Authorization`:

```bash
curl -X GET "http://localhost:8000/api/surveys" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Примеры кода из проекта

### Структура файлов

```
src/
├── services/
│   └── ldap/
│       ├── __init__.py
│       ├── ldap_service.py          # Основной LDAP сервис
│       └── ldap_role_mapper.py      # Маппинг ролей (опционально)
├── api/
│   └── routers/
│       └── auth/
│           ├── router.py            # API роутер
│           ├── handlers.py          # LdapAuthHandler
│           └── models.py            # Pydantic модели
└── config/
    └── settings.py                  # Настройки LDAP
```

### Ключевые моменты реализации

1. **Обработка ошибок**: Все ошибки LDAP логируются и преобразуются в понятные HTTP исключения
2. **Логирование**: Все операции логируются для отладки
3. **Безопасность**: Пароли никогда не сохраняются в локальной БД для LDAP пользователей
4. **Синхронизация**: При каждом входе данные пользователя могут обновляться из LDAP
5. **Мультитенантность**: Поддержка работы с несколькими компаниями

---

## Отладка

### Проверка подключения к LDAP

Вы можете создать тестовый скрипт для проверки подключения:

```python
from services.ldap.ldap_service import LdapService

ldap_service = LdapService()

# Проверка подключения
try:
    conn = ldap_service._get_service_connection()
    print("✓ Подключение к LDAP успешно")
    conn.unbind()
except Exception as e:
    print(f"✗ Ошибка подключения: {e}")

# Поиск пользователя
user = ldap_service.find_user_by_email("test@example.com")
print(f"Пользователь найден: {user}")
```

### Общие проблемы

1. **"LDAP сервер недоступен"**
   - Проверьте `LDAP_HOST` и `LDAP_PORT`
   - Убедитесь, что LDAP сервер доступен из сети
   - Проверьте настройки firewall

2. **"Неверный email или пароль"**
   - Проверьте правильность `search_filter` в методе `find_user_by_email`
   - Убедитесь, что в LDAP есть пользователь с таким email
   - Проверьте пароль пользователя

3. **"Найдено несколько пользователей"**
   - Проверьте уникальность email в LDAP
   - Возможно, нужно уточнить `search_filter`

4. **Проблемы с SSL**
   - Попробуйте установить `LDAP_USE_SSL=False` для тестирования
   - Проверьте SSL сертификат LDAP сервера

---

## Дополнительные возможности

### Синхронизация пользователей

Вы можете создать задачу для периодической синхронизации всех пользователей из LDAP:

```python
async def sync_all_users_from_ldap():
    """Синхронизация всех пользователей из LDAP."""
    ldap_service = LdapService()
    all_users = ldap_service.get_all_users()  # Нужно реализовать этот метод
    
    for ldap_user in all_users:
        # Обновить или создать пользователя в БД
        ...
```

### Обновление данных при входе

При каждом входе можно обновлять данные пользователя из LDAP:

```python
# В методе ldap_login после успешной аутентификации
if employee:
    # Обновляем данные из LDAP
    await self.db_manager.employee_repository.update_employee(
        employee_id=employee["id"],
        full_name=ldap_user.get("displayName"),
        # другие поля
    )
```

---

## Заключение

Данная инструкция описывает полный процесс интеграции LDAP аутентификации в FastAPI приложение. Основные шаги:

1. ✅ Установка зависимостей
2. ✅ Настройка конфигурации
3. ✅ Создание LDAP сервиса
4. ✅ Создание обработчика авторизации
5. ✅ Создание API эндпоинта
6. ✅ Настройка переменных окружения

Адаптируйте код под структуру вашего LDAP сервера и требования вашего проекта. Для получения дополнительной информации обратитесь к документации библиотеки [ldap3](https://ldap3.readthedocs.io/).

