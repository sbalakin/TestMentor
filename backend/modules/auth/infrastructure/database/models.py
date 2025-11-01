"""
Auth Database Models
SQLAlchemy модели для аутентификации
"""

from sqlalchemy import Column, String, DateTime, Enum as SQLEnum
from datetime import datetime
import enum

from core.database import Base


class UserRole(str, enum.Enum):
    """Роли пользователей"""
    MANAGER = "MANAGER"  # Руководитель - видит всё
    MENTOR = "MENTOR"    # Ментор - видит только себя


class UserModel(Base):
    """Модель пользователя для аутентификации"""
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    
    # Связь с ментором (если роль MENTOR)
    mentor_id = Column(String, nullable=True)  # ID ментора из таблицы mentors
    
    is_active = Column(String, default="true")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"

