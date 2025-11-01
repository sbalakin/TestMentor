"""
User Entity
Доменная модель пользователя
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserRole:
    """Роли пользователей"""
    MANAGER = "MANAGER"
    MENTOR = "MENTOR"


class User(BaseModel):
    """Сущность пользователя"""
    id: str
    username: str
    email: EmailStr
    full_name: str
    role: str
    mentor_id: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

