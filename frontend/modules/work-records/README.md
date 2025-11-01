# Модуль: Записи о работе (Work Records)

## Описание
Модуль для управления записями о выполненной работе менторов. Позволяет добавлять, просматривать, редактировать и удалять записи о работе с автоматическим расчетом стоимости.

## Ответственность
- Добавление записей о выполненной работе
- Просмотр и фильтрация записей
- Расчет стоимости работ (часы × ставка)
- Группировка записей по месяцам для отчетов
- Статистика по менторам и периодам

## Структура модуля

### Domain (Доменный слой)
**entities/**
- `work-record.entity.js` - Сущность записи о работе с бизнес-логикой

**repositories/**
- `work-record.repository.interface.js` - Интерфейс репозитория

### Application (Слой приложения)
**use-cases/**
- `add-work-record.use-case.js` - Добавление записи о работе
- `get-work-records.use-case.js` - Получение записей с фильтрацией и статистикой

### Infrastructure (Слой инфраструктуры)
**repositories/**
- `work-record.repository.impl.js` - Реализация через LocalStorage

### Presentation (Слой представления)
**pages/**
- `add-work.html` - Страница добавления записи
- `view-works.html` - Страница просмотра всех записей

**controllers/**
- `add-work.controller.js` - Контроллер добавления
- `view-works.controller.js` - Контроллер просмотра списка

## Бизнес-правила

1. **Ментор обязателен** - Нельзя создать запись без ментора
2. **Часы в диапазоне (0.1, 24]** - Минимум 0.1 час, максимум 24 часа в день
3. **Дата не в будущем** - Нельзя добавить работу на будущую дату
4. **Описание обязательно** - Должно быть описание что было сделано
5. **Автоматический расчет** - Сумма = часы × ставка ментора
6. **Статус по умолчанию** - "completed" (завершена)

## События

### Публикует
```javascript
// При добавлении записи
{
  type: 'work:added',
  payload: {
    workRecordId: 'work_123',
    mentorId: 'mentor_456',
    hours: 8.0,
    date: '2025-10-31'
  }
}

// При обновлении записи
{
  type: 'work:updated',
  payload: {
    workRecordId: 'work_123',
    mentorId: 'mentor_456'
  }
}

// При удалении записи
{
  type: 'work:deleted',
  payload: {
    workRecordId: 'work_123',
    mentorId: 'mentor_456'
  }
}
```

### Подписан на
- `mentor:deleted` - Обработка удаления ментора (пометить записи или спросить пользователя)
- `report:generating` - Подготовка данных для генерации отчета

## Зависимости

### Core
- `core/events/event-bus.js` - Для публикации событий
- `core/shared/storage.js` - Для хранения данных
- `core/shared/validators.js` - Для валидации
- `core/shared/formatters.js` - Для форматирования

### Внешние модули
- `mentors` - Для получения списка менторов и их ставок

## API (Use Cases)

### AddWorkRecordUseCase
```javascript
await addWorkRecordUseCase.execute({
  mentorId: 'mentor_123',
  date: '2025-10-31',
  hours: 8.0,
  description: 'Обучение React',
  category: 'mentoring',
  notes: 'Дополнительные заметки',
  status: 'completed'
});
```

### GetWorkRecordsUseCase
```javascript
// Получить все записи
const records = await getWorkRecordsUseCase.execute();

// С фильтрами
const filteredRecords = await getWorkRecordsUseCase.execute({
  mentorId: 'mentor_123',
  status: 'completed',
  category: 'mentoring',
  startDate: '2025-10-01',
  endDate: '2025-10-31',
  month: 10,
  year: 2025,
  sortBy: 'date',
  sortOrder: 'desc'
});

// Получить по ID
const record = await getWorkRecordsUseCase.getById('work_123');

// Статистика по ментору
const stats = await getWorkRecordsUseCase.getMentorStats(
  'mentor_123',
  '2025-10-01',
  '2025-10-31'
);
```

## Хранилище данных

### LocalStorage ключ
`mentor_system_work_records`

### Структура данных
```json
[
  {
    "id": "work_1730000000_abc123",
    "mentorId": "mentor_123",
    "date": "2025-10-31",
    "hours": 8.0,
    "description": "Обучение основам React",
    "category": "mentoring",
    "status": "completed",
    "notes": "Отличный прогресс студента",
    "createdAt": "2025-10-31T10:00:00.000Z",
    "updatedAt": "2025-10-31T10:00:00.000Z"
  }
]
```

## Фичи

### Добавление записи (add-work.html)
- Выбор ментора из выпадающего списка (только активные)
- Выбор даты (не позднее сегодня)
- Ввод количества часов (0.1-24)
- Описание работы
- Категория работы
- Дополнительные заметки
- Автоматический расчет стоимости в реальном времени

### Просмотр записей (view-works.html)
- Таблица всех записей
- Фильтры:
  - По ментору
  - По месяцу
  - По категории
- Сводка: общее количество записей, часов, сумма
- Действия: просмотр, редактирование, удаление

## TODO

- [ ] Реализовать UpdateWorkRecordUseCase
- [ ] Реализовать DeleteWorkRecordUseCase
- [ ] Добавить страницу просмотра детальной информации о записи
- [ ] Добавить страницу редактирования записи
- [ ] Добавить массовое добавление записей (импорт из CSV/Excel)
- [ ] Добавить экспорт записей в Excel
- [ ] Добавить графики статистики
- [ ] Добавить Unit/Integration тесты

## История изменений

### v1.0.0 (2025-10-31)
- Базовая реализация модуля
- Добавление и просмотр записей
- Фильтрация и статистика
- Интеграция с модулем Mentors
- Event-driven архитектура

---

**Статус**: В разработке  
**Покрытие тестами**: 0%  
**Последнее обновление**: 2025-10-31

