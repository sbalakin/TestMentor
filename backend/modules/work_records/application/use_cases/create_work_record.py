"""
Create Work Record Use Case
Создание записи о работе
"""

import uuid
from datetime import datetime

from modules.work_records.domain.entities.work_record import WorkRecord
from modules.work_records.infrastructure.repositories.work_record_repository_impl import WorkRecordRepository
from modules.work_records.application.dto.work_record_dto import WorkRecordCreateDTO


class CreateWorkRecordUseCase:
    """Use case для создания записи о работе"""
    
    def __init__(self, repository: WorkRecordRepository):
        self.repository = repository
    
    def execute(self, dto: WorkRecordCreateDTO) -> WorkRecord:
        """
        Выполнить создание записи о работе
        
        Args:
            dto: DTO с данными записи
            
        Returns:
            Созданная запись
        """
        # Создание сущности
        work_record = WorkRecord(
            id=f"work_{uuid.uuid4().hex[:12]}",
            mentor_id=dto.mentorId,
            date=dto.date,
            hours=dto.hours,
            description=dto.description,
            category=dto.category,
            status=dto.status,
            notes=dto.notes,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Сохранение
        created_record = self.repository.create(work_record)
        
        return created_record

