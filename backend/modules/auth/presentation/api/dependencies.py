"""
Auth Dependencies
Зависимости для FastAPI endpoints
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from core.database import get_db
from modules.auth.infrastructure.security import decode_access_token
from modules.auth.infrastructure.repositories.user_repository import UserRepository
from modules.auth.domain.entities.user import User, UserRole

# Security схема
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Получить текущего пользователя из токена
    """
    token = credentials.credentials
    
    # Декодировать токен
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный токен",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный токен",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Получить пользователя из БД
    user_repo = UserRepository(db)
    user_model = user_repo.find_by_username(username)
    
    if user_model is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Конвертировать в User entity
    return User(
        id=user_model.id,
        username=user_model.username,
        email=user_model.email,
        full_name=user_model.full_name,
        role=user_model.role.value,
        mentor_id=user_model.mentor_id,
        is_active=(user_model.is_active == "true"),
        created_at=user_model.created_at,
        updated_at=user_model.updated_at
    )


async def get_current_manager(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Проверить что пользователь - руководитель
    """
    if current_user.role != UserRole.MANAGER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ запрещен. Требуется роль руководителя."
        )
    
    return current_user


def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Получить текущего пользователя (опционально)
    """
    if not credentials:
        return None
    
    try:
        return get_current_user(credentials, db)
    except HTTPException:
        return None

