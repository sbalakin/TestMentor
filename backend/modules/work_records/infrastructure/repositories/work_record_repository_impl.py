"""
Work Record Repository Implementation
Реализация репозитория через SQLAlchemy
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from modules.work_records.domain.entities.work_record import WorkRecord
from modules.work_records.infrastructure.database.models import WorkRecordModel


class WorkRecordRepository:
    """Реализация репозитория записей о работе"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def _to_entity(self, model: WorkRecordModel) -> WorkRecord:
        """Преобразовать модель БД в сущность"""
        return WorkRecord(
            id=model.id,
            mentor_id=model.mentor_id,
            date=model.date,
            hours=model.hours,
            description=model.description,
            category=model.category,
            status=model.status,
            notes=model.notes,
            created_at=model.created_at,
            updated_at=model.updated_at
        )
    
    def _to_model(self, entity: WorkRecord) -> WorkRecordModel:
        """Преобразовать сущность в модель БД"""
        return WorkRecordModel(
            id=entity.id,
            mentor_id=entity.mentor_id,
            date=entity.date,
            hours=entity.hours,
            description=entity.description,
            category=entity.category,
            status=entity.status,
            notes=entity.notes,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )
    
    def find_all(self) -> List[WorkRecord]:
        """Получить все записи"""
        models = self.db.query(WorkRecordModel).order_by(WorkRecordModel.date.desc()).all()
        return [self._to_entity(model) for model in models]
    
    def find_by_id(self, record_id: str) -> Optional[WorkRecord]:
        """Получить запись по ID"""
        model = self.db.query(WorkRecordModel).filter(WorkRecordModel.id == record_id).first()
        return self._to_entity(model) if model else None
    
    def find_by_mentor(self, mentor_id: str) -> List[WorkRecord]:
        """Получить записи по ментору"""
        models = self.db.query(WorkRecordModel)\
            .filter(WorkRecordModel.mentor_id == mentor_id)\
            .order_by(WorkRecordModel.date.desc())\
            .all()
        return [self._to_entity(model) for model in models]
    
    def find_by_date_range(self, start_date: str, end_date: str) -> List[WorkRecord]:
        """Получить записи за период"""
        models = self.db.query(WorkRecordModel)\
            .filter(WorkRecordModel.date >= start_date)\
            .filter(WorkRecordModel.date <= end_date)\
            .order_by(WorkRecordModel.date.desc())\
            .all()
        return [self._to_entity(model) for model in models]
    
    def create(self, work_record: WorkRecord) -> WorkRecord:
        """Создать запись"""
        model = self._to_model(work_record)
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return self._to_entity(model)
    
    def update(self, work_record: WorkRecord) -> WorkRecord:
        """Обновить запись"""
        model = self.db.query(WorkRecordModel).filter(WorkRecordModel.id == work_record.id).first()
        if not model:
            raise ValueError(f"Work record with id {work_record.id} not found")
        
        model.date = work_record.date
        model.hours = work_record.hours
        model.description = work_record.description
        model.category = work_record.category
        model.status = work_record.status
        model.notes = work_record.notes
        model.updated_at = work_record.updated_at
        
        self.db.commit()
        self.db.refresh(model)
        return self._to_entity(model)
    
    def delete(self, record_id: str) -> bool:
        """Удалить запись"""
        model = self.db.query(WorkRecordModel).filter(WorkRecordModel.id == record_id).first()
        if not model:
            return False
        
        self.db.delete(model)
        self.db.commit()
        return True

