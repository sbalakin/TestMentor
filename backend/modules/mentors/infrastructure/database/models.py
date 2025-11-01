"""
Mentors Database Models
Модели SQLAlchemy для менторов
"""

from sqlalchemy import Column, String, Float, DateTime, Enum
from datetime import datetime
import enum

from core.database import Base


class MentorStatus(str, enum.Enum):
    """Статусы ментора"""
    ACTIVE = "active"
    INACTIVE = "inactive"


class MentorModel(Base):
    """Модель ментора в БД"""
    
    __tablename__ = "mentors"
    
    id = Column(String, primary_key=True, index=True)
    full_name = Column(String, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    specialization = Column(String, nullable=False)
    hourly_rate = Column(Float, nullable=False)
    start_date = Column(String, nullable=False)
    status = Column(Enum(MentorStatus), nullable=False, default=MentorStatus.ACTIVE)
    passport_or_inn = Column(String, nullable=True)
    bank_details = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Mentor(id={self.id}, name={self.full_name}, email={self.email})>"

