"""
Work Records Database Models
Модели SQLAlchemy для записей о работе
"""

from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from datetime import datetime

from core.database import Base


class WorkRecordModel(Base):
    """Модель записи о работе в БД"""
    
    __tablename__ = "work_records"
    
    id = Column(String, primary_key=True, index=True)
    mentor_id = Column(String, ForeignKey("mentors.id"), nullable=False, index=True)
    date = Column(String, nullable=False, index=True)
    hours = Column(Float, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False, default="other")
    status = Column(String, nullable=False, default="completed")
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<WorkRecord(id={self.id}, mentor_id={self.mentor_id}, date={self.date})>"

