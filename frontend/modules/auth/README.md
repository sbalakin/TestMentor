# Модуль Auth

Модуль аутентификации и авторизации системы.

## Функциональность

✅ Логин пользователей (руководители и менторы)
✅ JWT токены для авторизации
✅ Автоматическое добавление токенов в API запросы
✅ Проверка прав доступа
✅ Разделение прав: MANAGER и MENTOR
✅ Выход из системы

## Структура

```
auth/
├── domain/                 # Доменный слой
├── application/           # Слой приложения
│   └── use-cases/
│       ├── login.use-case.js
│       └── logout.use-case.js
├── infrastructure/        # Инфраструктура
│   └── auth.service.js    # Сервис авторизации
└── presentation/          # Представление
    ├── pages/
    │   └── login.html     # Страница логина
    ├── controllers/
    │   └── login.controller.js
    └── styles/
        └── auth.css       # Стили
```

## Использование

### Страница логина

Откройте: `/modules/auth/presentation/pages/login.html`

### Проверка авторизации

```javascript
import authService from '/modules/auth/infrastructure/auth.service.js';

// Проверить авторизован ли пользователь
if (!authService.isAuthenticated()) {
    window.location.href = '/modules/auth/presentation/pages/login.html';
}

// Получить текущего пользователя
const user = authService.getCurrentUser();
console.log(user); // { id, username, email, full_name, role, ... }

// Проверить роль
if (authService.isManager()) {
    // Код для руководителя
}

if (authService.isMentor()) {
    // Код для ментора
}
```

### Выход из системы

```javascript
import LogoutUseCase from '/modules/auth/application/use-cases/logout.use-case.js';

const logout = new LogoutUseCase();
logout.execute();
```

## Роли

### MANAGER (Руководитель)

✅ Видит всех менторов
✅ Видит все записи о работе
✅ Может создавать/редактировать/удалять менторов
✅ Может создавать записи о работе для любого ментора
✅ Может регистрировать новых пользователей

### MENTOR (Ментор)

✅ Видит только себя в списке менторов
✅ Видит только свои записи о работе
✅ Может редактировать свой профиль
✅ Может создавать записи о работе только для себя
❌ Не может удалять менторов
❌ Не может видеть других менторов

## Тестовые учетные записи

### Руководители:

- `admin` / `admin123`
- `manager` / `manager123`

### Менторы:

- `mentor1` / `mentor1123` (Алексеев Кирилл Дмитриевич)
- `mentor2` / `mentor2123` (Соколов Екатерина Максимович)
- `mentor3` / `mentor3123` (Иванова Кирилл Сергеевич)
- `mentor4` / `mentor4123` (Лебедев Кирилл Дмитриевна)
- `mentor5` / `mentor5123` (Иванов Матвей Максимович)

## API Endpoints

- `POST /api/auth/login` - Логин
- `GET /api/auth/me` - Получить текущего пользователя
- `POST /api/auth/register` - Регистрация (только для MANAGER)

## События

- `auth:logout` - Выход из системы

