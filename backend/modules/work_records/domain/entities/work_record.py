"""
Work Record Entity
Доменная сущность записи о работе
"""

from datetime import datetime
from typing import Optional


class WorkRecord:
    """Сущность записи о работе"""
    
    def __init__(
        self,
        id: str,
        mentor_id: str,
        date: str,
        hours: float,
        description: str,
        category: str = "other",
        status: str = "completed",
        notes: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self.id = id
        self.mentor_id = mentor_id
        self.date = date
        self.hours = hours
        self.description = description
        self.category = category
        self.status = status
        self.notes = notes
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
    
    def is_completed(self) -> bool:
        """Проверка завершенности"""
        return self.status == "completed"
    
    def is_approved(self) -> bool:
        """Проверка одобрения"""
        return self.status == "approved"
    
    def mark_completed(self) -> None:
        """Отметить как завершенную"""
        self.status = "completed"
        self.updated_at = datetime.utcnow()
    
    def approve(self) -> None:
        """Одобрить запись"""
        self.status = "approved"
        self.updated_at = datetime.utcnow()
    
    def to_dict(self) -> dict:
        """Преобразовать в словарь"""
        return {
            "id": self.id,
            "mentorId": self.mentor_id,
            "date": self.date,
            "hours": self.hours,
            "description": self.description,
            "category": self.category,
            "status": self.status,
            "notes": self.notes,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None
        }

