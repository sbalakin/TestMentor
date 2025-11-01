"""
User Repository Implementation
Реализация репозитория пользователей
"""

from sqlalchemy.orm import Session
from typing import Optional, List
import uuid

from modules.auth.infrastructure.database.models import UserModel, UserRole
from modules.auth.infrastructure.security import get_password_hash


class UserRepository:
    """Репозиторий для работы с пользователями"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, username: str, email: str, password: str, 
               full_name: str, role: str, mentor_id: Optional[str] = None) -> UserModel:
        """Создать пользователя"""
        user = UserModel(
            id=f"user_{uuid.uuid4().hex[:12]}",
            username=username,
            email=email,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            role=UserRole(role),
            mentor_id=mentor_id,
            is_active="true"
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    def find_by_username(self, username: str) -> Optional[UserModel]:
        """Найти пользователя по username"""
        return self.db.query(UserModel).filter(UserModel.username == username).first()
    
    def find_by_email(self, email: str) -> Optional[UserModel]:
        """Найти пользователя по email"""
        return self.db.query(UserModel).filter(UserModel.email == email).first()
    
    def find_by_id(self, user_id: str) -> Optional[UserModel]:
        """Найти пользователя по ID"""
        return self.db.query(UserModel).filter(UserModel.id == user_id).first()
    
    def find_by_mentor_id(self, mentor_id: str) -> Optional[UserModel]:
        """Найти пользователя-ментора по ID ментора"""
        return self.db.query(UserModel).filter(
            UserModel.mentor_id == mentor_id,
            UserModel.role == UserRole.MENTOR
        ).first()
    
    def find_all(self) -> List[UserModel]:
        """Получить всех пользователей"""
        return self.db.query(UserModel).all()

