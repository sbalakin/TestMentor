# Руководство по внесению вклада

Спасибо за ваш интерес к улучшению проекта! 🎉

## Как внести вклад

### 1. Сообщить об ошибке (Bug Report)

Если вы нашли ошибку:

1. Проверьте, не была ли она уже сообщена в [Issues](https://github.com/yourusername/mentor-system/issues)
2. Если нет, создайте новый Issue с описанием:
   - Что вы делали
   - Что ожидали увидеть
   - Что увидели на самом деле
   - Шаги для воспроизведения
   - Скриншоты (если применимо)
   - Браузер и версия

### 2. Предложить улучшение (Feature Request)

Есть идея? Создайте Issue с меткой `enhancement`:

- Опишите проблему, которую решает ваша идея
- Опишите предлагаемое решение
- Опишите альтернативы, если есть
- Приложите mockups или примеры (если есть)

### 3. Внести код (Pull Request)

#### Процесс:

1. **Fork** репозитория
2. **Создайте ветку** от `main`:
   ```bash
   git checkout -b feature/amazing-feature
   # или
   git checkout -b fix/bug-fix
   ```

3. **Внесите изменения**:
   - Следуйте [стандартам кода](#стандарты-кода)
   - Добавьте тесты (когда они появятся)
   - Обновите документацию

4. **Commit** с понятным сообщением:
   ```bash
   git commit -m "feat: добавить функцию X"
   git commit -m "fix: исправить ошибку Y"
   ```

5. **Push** в ваш fork:
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Создайте Pull Request** в основной репозиторий

#### Требования к PR:

- ✅ Описание изменений
- ✅ Ссылка на связанный Issue (если есть)
- ✅ Скриншоты (для UI изменений)
- ✅ Код соответствует стандартам
- ⏳ Тесты пройдены (когда появятся)

## Стандарты кода

### JavaScript

```javascript
// ✅ Хорошо
class MyService {
  /**
   * Описание метода
   * @param {string} param - Описание параметра
   * @returns {Promise<Object>}
   */
  async myMethod(param) {
    // Код
  }
}

// ❌ Плохо
class myservice {
  myMethod(param) {
    // Без документации
  }
}
```

**Правила**:
- ES6+ синтаксис
- Async/Await вместо Promise.then()
- JSDoc комментарии для публичных методов
- Названия классов: `PascalCase`
- Названия методов/переменных: `camelCase`
- Константы: `UPPER_CASE`
- Файлы: `kebab-case.js`

### HTML

```html
<!-- ✅ Хорошо -->
<div class="card">
  <h2 class="card-title">Заголовок</h2>
  <p class="card-text">Текст</p>
</div>

<!-- ❌ Плохо -->
<div class="Card">
  <h2 class="CardTitle">Заголовок</h2>
</div>
```

**Правила**:
- Семантические теги
- Классы: `kebab-case`
- Атрибуты с двойными кавычками
- Отступы: 4 пробела

### CSS

```css
/* ✅ Хорошо */
.card {
  display: flex;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}

/* ❌ Плохо */
.Card {
  display: flex;
  padding: 16px;
}
```

**Правила**:
- Использовать CSS Variables
- Классы: `kebab-case`
- Селекторы: низкая специфичность
- Комментарии для секций

## Архитектура

### Добавление нового модуля

1. **Создайте структуру**:
```
frontend/modules/new-module/
├── module.js
├── README.md
├── domain/
│   ├── entities/
│   ├── value-objects/
│   └── repositories/
├── application/
│   └── use-cases/
├── infrastructure/
│   └── repositories/
└── presentation/
    ├── pages/
    ├── controllers/
    └── styles/
```

2. **Реализуйте Clean Architecture**:
   - Domain: бизнес-логика без зависимостей
   - Application: use cases и DTO
   - Infrastructure: реализация (LocalStorage и т.д.)
   - Presentation: UI (HTML, контроллеры, стили)

3. **Зарегистрируйте модуль** в `core/app.js`

4. **Создайте README.md** для модуля

5. **Используйте Event Bus** для коммуникации

### Правила модулей

- ✅ Модули независимы друг от друга
- ✅ Коммуникация только через Event Bus
- ✅ Можно использовать `core/shared` утилиты
- ❌ НЕТ прямых импортов между модулями
- ❌ НЕТ прямых вызовов use cases других модулей

## Commit сообщения

Используем [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]

[optional footer]
```

**Types**:
- `feat:` - новая функция
- `fix:` - исправление ошибки
- `docs:` - изменения в документации
- `style:` - форматирование, без изменения логики
- `refactor:` - рефакторинг кода
- `test:` - добавление тестов
- `chore:` - обновление зависимостей, конфигурации

**Примеры**:
```bash
feat: добавить генерацию PDF отчетов
fix: исправить расчет суммы для менторов
docs: обновить README с инструкциями по деплою
refactor: переписать MentorRepository на классы
```

## Документация

При добавлении нового функционала:

1. Обновите README модуля
2. Добавьте JSDoc комментарии
3. Обновите основной README (если нужно)
4. Обновите CHANGELOG.md

## Вопросы?

Не стесняйтесь задавать вопросы в [Discussions](https://github.com/yourusername/mentor-system/discussions) или Issues.

Спасибо за вклад! 🚀

