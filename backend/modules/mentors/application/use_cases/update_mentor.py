"""
Update Mentor Use Case
Обновление ментора
"""

from datetime import datetime

from modules.mentors.domain.entities.mentor import Mentor
from modules.mentors.domain.repositories.mentor_repository import IMentorRepository
from modules.mentors.application.dto.mentor_dto import MentorUpdateDTO


class UpdateMentorUseCase:
    """Use case для обновления ментора"""
    
    def __init__(self, repository: IMentorRepository):
        self.repository = repository
    
    def execute(self, mentor_id: str, dto: MentorUpdateDTO) -> Mentor:
        """
        Выполнить обновление ментора
        
        Args:
            mentor_id: ID ментора
            dto: DTO с новыми данными
            
        Returns:
            Обновленный ментор
            
        Raises:
            ValueError: Если ментор не найден или email занят
        """
        # Получение существующего ментора
        mentor = self.repository.find_by_id(mentor_id)
        if not mentor:
            raise ValueError(f"Ментор с ID {mentor_id} не найден")
        
        # Проверка уникальности email (если изменился)
        if dto.email and dto.email != mentor.email:
            existing = self.repository.find_by_email(dto.email)
            if existing and existing.id != mentor_id:
                raise ValueError(f"Ментор с email {dto.email} уже существует")
        
        # Обновление полей
        if dto.fullName is not None:
            mentor.full_name = dto.fullName
        if dto.email is not None:
            mentor.email = dto.email
        if dto.phone is not None:
            mentor.phone = dto.phone
        if dto.photoUrl is not None:
            mentor.photo_url = dto.photoUrl
        if dto.specialization is not None:
            mentor.specialization = dto.specialization
        if dto.hourlyRate is not None:
            mentor.hourly_rate = dto.hourlyRate
        if dto.startDate is not None:
            mentor.start_date = dto.startDate
        if dto.status is not None:
            mentor.status = dto.status
        if dto.passportOrInn is not None:
            mentor.passport_or_inn = dto.passportOrInn
        if dto.bankDetails is not None:
            mentor.bank_details = dto.bankDetails
        if dto.notes is not None:
            mentor.notes = dto.notes
        
        mentor.updated_at = datetime.utcnow()
        
        # Сохранение
        updated_mentor = self.repository.update(mentor)
        
        return updated_mentor

