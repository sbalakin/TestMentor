"""
Login Use Case
Сценарий логина пользователя
"""

from sqlalchemy.orm import Session
from typing import Optional

from modules.auth.infrastructure.repositories.user_repository import UserRepository
from modules.auth.infrastructure.security import verify_password, create_access_token
from modules.auth.application.dto.auth_dto import LoginResponse


class LoginUseCase:
    """Use Case для логина"""
    
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)
    
    def execute(self, username: str, password: str) -> Optional[LoginResponse]:
        """
        Выполнить логин
        
        Args:
            username: Имя пользователя
            password: Пароль
            
        Returns:
            LoginResponse если успешно, None если ошибка
        """
        # Найти пользователя
        user = self.user_repo.find_by_username(username)
        
        if not user:
            return None
        
        # Проверить пароль
        if not verify_password(password, user.hashed_password):
            return None
        
        # Проверить активность
        if user.is_active != "true":
            return None
        
        # Создать токен
        access_token = create_access_token(
            data={
                "sub": user.username,
                "user_id": user.id,
                "role": user.role.value,
                "mentor_id": user.mentor_id
            }
        )
        
        # Вернуть ответ
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role.value,
                "mentor_id": user.mentor_id
            }
        )

