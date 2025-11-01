# Модуль: Управление менторами (Mentors)

## Описание
Модуль для полного управления жизненным циклом менторов в системе: создание, просмотр, редактирование, удаление профилей специалистов.

## Ответственность
- CRUD операции для менторов
- Валидация данных менторов (email, телефон, ставка)
- Поиск и фильтрация менторов
- Управление статусами (активный/неактивный)
- Отображение профилей менторов

## Структура модуля

### Domain (Доменный слой)
**entities/**
- `mentor.entity.js` - Бизнес-сущность ментора с логикой активации/деактивации

**value-objects/**
- `email.vo.js` - Value Object для email с валидацией
- `phone.vo.js` - Value Object для телефона с валидацией и форматированием

**repositories/**
- `mentor.repository.interface.js` - Интерфейс репозитория ментора

### Application (Слой приложения)
**use-cases/**
- `create-mentor.use-case.js` - Создание нового ментора
- `get-mentors.use-case.js` - Получение списка менторов с фильтрацией
- `delete-mentor.use-case.js` - Удаление ментора

**dto/**
- (будут добавлены при необходимости)

**events/**
- `mentor:created` - Ментор создан
- `mentor:updated` - Ментор обновлен
- `mentor:deleted` - Ментор удален
- `mentor:deactivated` - Ментор деактивирован

### Infrastructure (Слой инфраструктуры)
**repositories/**
- `mentor.repository.impl.js` - Реализация репозитория через LocalStorage

### Presentation (Слой представления)
**pages/**
- `create-mentor.html` - Страница создания ментора
- `view-mentor.html` - Страница просмотра профиля (TODO)
- `edit-mentor.html` - Страница редактирования (TODO)

**controllers/**
- `mentor-create.controller.js` - Контроллер создания ментора
- `mentor-list.controller.js` - Контроллер списка менторов (частично в dashboard)

**styles/**
- `mentors.css` - Стили модуля

## Бизнес-правила

1. **Email уникален** - В системе не может быть двух менторов с одинаковым email
2. **Обязательные поля** - ФИО, Email, Специализация, Ставка обязательны
3. **Ставка > 0** - Ставка должна быть положительным числом
4. **Телефон опциональный** - Но если указан, должен быть в формате +7 (999) 999-99-99
5. **Статус** - Может быть "active" или "inactive"
6. **Деактивация предпочтительнее удаления** - При наличии связанных записей

## События

### Публикует
```javascript
// При создании ментора
{
  type: 'mentor:created',
  payload: {
    mentorId: 'mentor_123',
    fullName: 'Иванов И.И.',
    email: 'ivanov@example.com'
  }
}

// При удалении ментора
{
  type: 'mentor:deleted',
  payload: {
    mentorId: 'mentor_123',
    fullName: 'Иванов И.И.'
  }
}

// При деактивации ментора
{
  type: 'mentor:deactivated',
  payload: {
    mentorId: 'mentor_123',
    fullName: 'Иванов И.И.'
  }
}
```

### Подписан на
- `work:added` - Обновление статистики ментора (TODO)
- `report:generated` - Обновление информации об актах (TODO)

## Зависимости

### Core
- `core/events/event-bus.js` - Для публикации событий
- `core/shared/storage.js` - Для хранения данных
- `core/shared/validators.js` - Для валидации
- `core/shared/formatters.js` - Для форматирования данных

### Внешние модули
- Не зависит от других модулей (независимый модуль)

## API (Use Cases)

### CreateMentorUseCase
```javascript
await createMentorUseCase.execute({
  fullName: 'Иванов Иван Иванович',
  email: 'ivanov@example.com',
  phone: '+7 (999) 123-45-67',
  specialization: 'Разработка ботов',
  hourlyRate: 1500,
  startDate: '2025-01-01',
  status: 'active',
  passportOrInn: '1234 567890',
  bankDetails: 'Р/с...',
  notes: 'Примечания'
});
```

### GetMentorsUseCase
```javascript
// Получить всех
const mentors = await getMentorsUseCase.execute();

// С фильтрами
const activeMentors = await getMentorsUseCase.execute({
  status: 'active',
  search: 'иван',
  sortBy: 'fullName',
  sortOrder: 'asc'
});

// Получить по ID
const mentor = await getMentorsUseCase.getById('mentor_123');
```

### DeleteMentorUseCase
```javascript
// Удалить
await deleteMentorUseCase.execute('mentor_123');

// Деактивировать (мягкое удаление)
await deleteMentorUseCase.deactivate('mentor_123');
```

## Хранилище данных

### LocalStorage ключ
`mentor_system_mentors`

### Структура данных
```json
[
  {
    "id": "mentor_1234567890_abc123",
    "fullName": "Иванов Иван Иванович",
    "email": "ivanov@example.com",
    "phone": "79991234567",
    "photoUrl": null,
    "specialization": "Разработка ботов",
    "hourlyRate": 1500,
    "startDate": "2025-01-01",
    "status": "active",
    "passportOrInn": "1234 567890",
    "bankDetails": "Р/с...",
    "notes": "Примечания",
    "tags": [],
    "createdAt": "2025-10-31T10:00:00.000Z",
    "updatedAt": "2025-10-31T10:00:00.000Z"
  }
]
```

## Тестирование

### Сценарии для тестирования

1. **Создание ментора**
   - С валидными данными
   - С невалидным email
   - С дублирующимся email
   - Без обязательных полей
   - С отрицательной ставкой

2. **Получение менторов**
   - Получить всех
   - Фильтр по статусу
   - Поиск по имени
   - Сортировка

3. **Удаление ментора**
   - Удалить существующего
   - Удалить несуществующего
   - Деактивировать

### Unit тесты (TODO)
- `mentor.entity.test.js`
- `email.vo.test.js`
- `phone.vo.test.js`
- `create-mentor.use-case.test.js`

### Integration тесты (TODO)
- `mentor.repository.test.js`
- `mentor-flow.test.js`

## TODO

- [ ] Реализовать `view-mentor.html` и контроллер
- [ ] Реализовать `edit-mentor.html` и контроллер
- [ ] Добавить UpdateMentorUseCase
- [ ] Добавить загрузку фото ментора
- [ ] Интеграция со статистикой (получение данных по работам)
- [ ] Добавить тесты
- [ ] Добавить экспорт менторов в Excel
- [ ] Добавить массовые операции

## История изменений

### v1.0.0 (2025-10-31)
- Базовая реализация модуля
- CRUD операции
- Валидация через Value Objects
- Интеграция с Event Bus
- Страница создания ментора

---

**Статус**: В разработке  
**Покрытие тестами**: 0%  
**Последнее обновление**: 2025-10-31

