# 🚀 LDAP - Быстрый старт

## ✅ Интеграция завершена!

LDAP аутентификация работает! Пользователи могут входить через корпоративный LDAP сервер `ldap.effective-mobile.ru`.

---

## 🎯 Как пользоваться

### Для пользователей:

1. **Откройте страницу входа:**
   ```
   http://localhost:8000/login.html
   ```

2. **Введите данные:**
   - **Логин:** ваш корпоративный email (из LDAP)
   - **Пароль:** ваш пароль LDAP

3. **Нажмите кнопку:**
   ```
   🔐 Войти через LDAP
   ```

4. **Готово!** ✨
   - При первом входе система автоматически создаст вашу учетную запись
   - Роль определится на основе вашей должности в LDAP

---

## 🔧 API Endpoint

### POST `/api/auth/ldap/login`

**Запрос:**
```json
{
  "username": "user@company.com",
  "password": "ldap_password"
}
```

**Ответ (успех):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1...",
  "token_type": "bearer",
  "user": {
    "id": "user-uuid",
    "username": "user",
    "email": "user@company.com",
    "full_name": "John Doe",
    "role": "MANAGER",
    "is_ldap_user": true
  }
}
```

---

## 🧪 Тестирование

### Swagger UI

1. Откройте: http://localhost:8001/docs
2. Найдите: `POST /api/auth/ldap/login`
3. Нажмите "Try it out"
4. Введите корпоративный email и пароль
5. Нажмите "Execute"

### Curl

```bash
curl -X POST "http://localhost:8001/api/auth/ldap/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "your-email@company.com", "password": "your-password"}'
```

---

## 📦 Что было добавлено

### Backend:
- ✅ `ldap3==2.9.1` - библиотека для работы с LDAP
- ✅ `ldap_service.py` - сервис для подключения к LDAP
- ✅ `ldap_login.py` - use case для LDAP авторизации
- ✅ `/api/auth/ldap/login` - API эндпоинт

### Frontend:
- ✅ Зеленая кнопка "🔐 Войти через LDAP"
- ✅ Автоматическая отправка запроса на LDAP эндпоинт
- ✅ Обработка ошибок и редирект

---

## 🔒 Безопасность

✅ **Пароли LDAP НЕ сохраняются в БД**
✅ **SSL/TLS соединение** с LDAP сервером
✅ **JWT токены** для API доступа
✅ **Обработка ошибок** без раскрытия информации

---

## ⚙️ Настройки

### LDAP Server:
```
Host: ldap.effective-mobile.ru
Port: 636 (SSL)
Base DN: dc=company,dc=com
```

### Служебная учетная запись:
```
Bind DN: uid=api,ou=service-accounts,dc=company,dc=com
Password: XEXed3ZPf6rR
```

---

## 📚 Документация

**Полная документация:** `LDAP_README.md`

**Файлы в папке LDAP/:**
- `LDAP_AI_PROMPT.md` - промпт для AI
- `LDAP_MIGRATION.md` - инструкция по интеграции
- `ldap.txt` - настройки LDAP сервера

---

## 🎉 Готово к использованию!

Теперь все сотрудники компании могут входить в KOI используя свои корпоративные учетные данные!

**Нет необходимости создавать отдельные аккаунты** - система автоматически создаст пользователя при первом входе через LDAP! 🚀


