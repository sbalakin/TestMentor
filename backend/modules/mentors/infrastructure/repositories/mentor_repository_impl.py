"""
Mentor Repository Implementation
Реализация репозитория через SQLAlchemy
"""

from typing import List, Optional
from sqlalchemy.orm import Session

from modules.mentors.domain.entities.mentor import Mentor
from modules.mentors.domain.repositories.mentor_repository import IMentorRepository
from modules.mentors.infrastructure.database.models import MentorModel


class MentorRepository(IMentorRepository):
    """Реализация репозитория менторов"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def _to_entity(self, model: MentorModel) -> Mentor:
        """Преобразовать модель БД в сущность"""
        return Mentor(
            id=model.id,
            full_name=model.full_name,
            email=model.email,
            phone=model.phone,
            photo_url=model.photo_url,
            specialization=model.specialization,
            hourly_rate=model.hourly_rate,
            start_date=model.start_date,
            status=model.status.value,
            passport_or_inn=model.passport_or_inn,
            bank_details=model.bank_details,
            notes=model.notes,
            created_at=model.created_at,
            updated_at=model.updated_at
        )
    
    def _to_model(self, entity: Mentor) -> MentorModel:
        """Преобразовать сущность в модель БД"""
        return MentorModel(
            id=entity.id,
            full_name=entity.full_name,
            email=entity.email,
            phone=entity.phone,
            photo_url=entity.photo_url,
            specialization=entity.specialization,
            hourly_rate=entity.hourly_rate,
            start_date=entity.start_date,
            status=entity.status,
            passport_or_inn=entity.passport_or_inn,
            bank_details=entity.bank_details,
            notes=entity.notes,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )
    
    def find_all(self) -> List[Mentor]:
        """Получить всех менторов"""
        models = self.db.query(MentorModel).all()
        return [self._to_entity(model) for model in models]
    
    def find_by_id(self, mentor_id: str) -> Optional[Mentor]:
        """Получить ментора по ID"""
        model = self.db.query(MentorModel).filter(MentorModel.id == mentor_id).first()
        return self._to_entity(model) if model else None
    
    def find_by_email(self, email: str) -> Optional[Mentor]:
        """Получить ментора по email"""
        model = self.db.query(MentorModel).filter(MentorModel.email == email).first()
        return self._to_entity(model) if model else None
    
    def find_by_status(self, status: str) -> List[Mentor]:
        """Получить менторов по статусу"""
        models = self.db.query(MentorModel).filter(MentorModel.status == status).all()
        return [self._to_entity(model) for model in models]
    
    def create(self, mentor: Mentor) -> Mentor:
        """Создать ментора"""
        model = self._to_model(mentor)
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return self._to_entity(model)
    
    def update(self, mentor: Mentor) -> Mentor:
        """Обновить ментора"""
        model = self.db.query(MentorModel).filter(MentorModel.id == mentor.id).first()
        if not model:
            raise ValueError(f"Mentor with id {mentor.id} not found")
        
        # Обновляем поля
        model.full_name = mentor.full_name
        model.email = mentor.email
        model.phone = mentor.phone
        model.photo_url = mentor.photo_url
        model.specialization = mentor.specialization
        model.hourly_rate = mentor.hourly_rate
        model.start_date = mentor.start_date
        model.status = mentor.status
        model.passport_or_inn = mentor.passport_or_inn
        model.bank_details = mentor.bank_details
        model.notes = mentor.notes
        model.updated_at = mentor.updated_at
        
        self.db.commit()
        self.db.refresh(model)
        return self._to_entity(model)
    
    def delete(self, mentor_id: str) -> bool:
        """Удалить ментора"""
        model = self.db.query(MentorModel).filter(MentorModel.id == mentor_id).first()
        if not model:
            return False
        
        self.db.delete(model)
        self.db.commit()
        return True
    
    def search(self, query: str) -> List[Mentor]:
        """Поиск менторов"""
        query_lower = query.lower()
        models = self.db.query(MentorModel).filter(
            (MentorModel.full_name.ilike(f"%{query_lower}%")) |
            (MentorModel.email.ilike(f"%{query_lower}%")) |
            (MentorModel.specialization.ilike(f"%{query_lower}%"))
        ).all()
        return [self._to_entity(model) for model in models]

