"""
Create Mentor Use Case
Сценарий создания ментора
"""

import uuid
from datetime import datetime

from modules.mentors.domain.entities.mentor import Mentor
from modules.mentors.domain.repositories.mentor_repository import IMentorRepository
from modules.mentors.application.dto.mentor_dto import MentorCreateDTO


class CreateMentorUseCase:
    """Use case для создания ментора"""
    
    def __init__(self, repository: IMentorRepository):
        self.repository = repository
    
    def execute(self, dto: MentorCreateDTO) -> Mentor:
        """
        Выполнить создание ментора
        
        Args:
            dto: DTO с данными ментора
            
        Returns:
            Созданный ментор
            
        Raises:
            ValueError: Если email уже занят
        """
        # Проверка уникальности email
        existing_mentor = self.repository.find_by_email(dto.email)
        if existing_mentor:
            raise ValueError(f"Ментор с email {dto.email} уже существует")
        
        # Создание сущности
        mentor = Mentor(
            id=f"mentor_{uuid.uuid4().hex[:12]}",
            full_name=dto.fullName,
            email=dto.email,
            phone=dto.phone,
            photo_url=dto.photoUrl,
            specialization=dto.specialization,
            hourly_rate=dto.hourlyRate,
            start_date=dto.startDate,
            status=dto.status,
            passport_or_inn=dto.passportOrInn,
            bank_details=dto.bankDetails,
            notes=dto.notes,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Сохранение
        created_mentor = self.repository.create(mentor)
        
        return created_mentor

