"""
LDAP Login Use Case
Сценарий логина пользователя через LDAP
"""

from sqlalchemy.orm import Session
from typing import Optional
import uuid

from modules.auth.infrastructure.ldap_service import LdapService
from modules.auth.infrastructure.repositories.user_repository import UserRepository
from modules.auth.infrastructure.security import create_access_token
from modules.auth.application.dto.auth_dto import LoginResponse
from modules.auth.infrastructure.database.models import UserRole


class LdapLoginUseCase:
    """Use Case для LDAP логина"""
    
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.ldap_service = LdapService()
    
    def execute(self, email: str, password: str) -> Optional[LoginResponse]:
        """
        Выполнить LDAP логин
        
        Args:
            email: Email пользователя из LDAP
            password: Пароль пользователя
            
        Returns:
            LoginResponse если успешно, None если ошибка
        """
        print(f"[LdapLoginUseCase] Попытка LDAP авторизации: {email}")
        
        # 1. Проверяем учетные данные в LDAP
        ldap_user = self.ldap_service.authenticate_user(email, password)
        
        if not ldap_user:
            print(f"[LdapLoginUseCase] Неверные учетные данные LDAP для {email}")
            return None
        
        # 2. Ищем или создаем пользователя в локальной БД
        user = self.user_repo.find_by_email(email)
        
        if not user:
            print(f"[LdapLoginUseCase] Пользователь {email} не найден, создаем нового...")
            
            # Определяем роль (по умолчанию MENTOR, если нужно - адаптируйте логику)
            role = self._determine_role(ldap_user.get("description"))
            
            # Создаем нового пользователя на основе LDAP данных
            username = email.split('@')[0]  # Используем часть до @ как username
            full_name = ldap_user.get("displayName") or ldap_user.get("cn", username)
            
            # Генерируем уникальное имя пользователя если уже существует
            base_username = username
            counter = 1
            while self.user_repo.find_by_username(username):
                username = f"{base_username}{counter}"
                counter += 1
            
            # Создаем пользователя с пустым паролем (LDAP пользователи не имеют локального пароля)
            user = self.user_repo.create(
                username=username,
                email=email,
                password="",  # Пустой пароль для LDAP пользователей
                full_name=full_name,
                role=role.value,
                mentor_id=None  # Если нужно связать с ментором - добавьте логику
            )
            print(f"[LdapLoginUseCase] Создан новый LDAP пользователь: {email} (role={role.value})")
        else:
            print(f"[LdapLoginUseCase] Пользователь {email} найден в БД")
        
        # 3. Проверяем активность
        if user.is_active != "true":
            print(f"[LdapLoginUseCase] Пользователь {email} неактивен")
            return None
        
        # 4. Создаем токен
        access_token = create_access_token(
            data={
                "sub": user.username,
                "user_id": user.id,
                "role": user.role.value,
                "mentor_id": user.mentor_id,
                "is_ldap_user": True
            }
        )
        
        # 5. Возвращаем ответ
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role.value,
                "mentor_id": user.mentor_id,
                "is_ldap_user": True
            }
        )
    
    def _determine_role(self, description: Optional[str]) -> UserRole:
        """
        Определить роль пользователя на основе должности из LDAP
        
        Args:
            description: Должность из LDAP
            
        Returns:
            UserRole: Роль пользователя
        """
        if not description:
            return UserRole.MENTOR
        
        description_lower = description.lower()
        
        # Определяем роль на основе ключевых слов
        manager_keywords = ["manager", "руководитель", "директор", "boss", "chief", "head"]
        
        for keyword in manager_keywords:
            if keyword in description_lower:
                return UserRole.MANAGER
        
        return UserRole.MENTOR


