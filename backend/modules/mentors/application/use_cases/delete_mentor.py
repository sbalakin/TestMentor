"""
Delete Mentor Use Case
Удаление ментора
"""

from modules.mentors.domain.repositories.mentor_repository import IMentorRepository


class DeleteMentorUseCase:
    """Use case для удаления ментора"""
    
    def __init__(self, repository: IMentorRepository):
        self.repository = repository
    
    def execute(self, mentor_id: str) -> bool:
        """
        Выполнить удаление ментора
        
        Args:
            mentor_id: ID ментора
            
        Returns:
            True если удален, False если не найден
        """
        return self.repository.delete(mentor_id)

