"""
Mentor Entity
Доменная сущность ментора с бизнес-логикой
"""

from datetime import datetime
from typing import Optional, List


class Mentor:
    """Сущность ментора"""
    
    def __init__(
        self,
        id: str,
        full_name: str,
        email: str,
        specialization: str,
        hourly_rate: float,
        start_date: str,
        status: str = "active",
        phone: Optional[str] = None,
        photo_url: Optional[str] = None,
        passport_or_inn: Optional[str] = None,
        bank_details: Optional[str] = None,
        notes: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self.id = id
        self.full_name = full_name
        self.email = email
        self.phone = phone
        self.photo_url = photo_url
        self.specialization = specialization
        self.hourly_rate = hourly_rate
        self.start_date = start_date
        self.status = status
        self.passport_or_inn = passport_or_inn
        self.bank_details = bank_details
        self.notes = notes
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
    
    def is_active(self) -> bool:
        """Проверка активности ментора"""
        return self.status == "active"
    
    def activate(self) -> None:
        """Активировать ментора"""
        self.status = "active"
        self.updated_at = datetime.utcnow()
    
    def deactivate(self) -> None:
        """Деактивировать ментора"""
        self.status = "inactive"
        self.updated_at = datetime.utcnow()
    
    def get_initials(self) -> str:
        """Получить инициалы"""
        words = self.full_name.strip().split()
        if len(words) == 0:
            return ""
        if len(words) == 1:
            return words[0][0].upper()
        return words[0][0].upper() + words[1][0].upper()
    
    def to_dict(self) -> dict:
        """Преобразовать в словарь"""
        return {
            "id": self.id,
            "fullName": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "photoUrl": self.photo_url,
            "specialization": self.specialization,
            "hourlyRate": self.hourly_rate,
            "startDate": self.start_date,
            "status": self.status,
            "passportOrInn": self.passport_or_inn,
            "bankDetails": self.bank_details,
            "notes": self.notes,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None
        }

