"""
Get Mentors Use Case
Получение менторов с фильтрацией
"""

from typing import List, Optional

from modules.mentors.domain.entities.mentor import Mentor
from modules.mentors.domain.repositories.mentor_repository import IMentorRepository


class GetMentorsUseCase:
    """Use case для получения менторов"""
    
    def __init__(self, repository: IMentorRepository):
        self.repository = repository
    
    def execute(
        self,
        status: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Mentor]:
        """
        Выполнить получение менторов
        
        Args:
            status: Фильтр по статусу
            search: Поисковый запрос
            
        Returns:
            Список менторов
        """
        # Поиск
        if search:
            return self.repository.search(search)
        
        # Фильтр по статусу
        if status:
            return self.repository.find_by_status(status)
        
        # Все менторы
        return self.repository.find_all()
    
    def get_by_id(self, mentor_id: str) -> Optional[Mentor]:
        """
        Получить ментора по ID
        
        Args:
            mentor_id: ID ментора
            
        Returns:
            Ментор или None
        """
        return self.repository.find_by_id(mentor_id)

