"""
Auth DTOs
Объекты передачи данных для аутентификации
"""

from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    """Запрос на логин"""
    username: str
    password: str


class LoginResponse(BaseModel):
    """Ответ на логин"""
    access_token: str
    token_type: str = "bearer"
    user: dict


class RegisterRequest(BaseModel):
    """Запрос на регистрацию"""
    username: str
    email: EmailStr
    password: str
    full_name: str
    role: str
    mentor_id: Optional[str] = None


class TokenData(BaseModel):
    """Данные из токена"""
    username: Optional[str] = None
    user_id: Optional[str] = None
    role: Optional[str] = None

