"""
Mentor Repository Interface
Интерфейс репозитория для работы с менторами
"""

from abc import ABC, abstractmethod
from typing import List, Optional

from modules.mentors.domain.entities.mentor import Mentor


class IMentorRepository(ABC):
    """Интерфейс репозитория менторов"""
    
    @abstractmethod
    def find_all(self) -> List[Mentor]:
        """Получить всех менторов"""
        pass
    
    @abstractmethod
    def find_by_id(self, mentor_id: str) -> Optional[Mentor]:
        """Получить ментора по ID"""
        pass
    
    @abstractmethod
    def find_by_email(self, email: str) -> Optional[Mentor]:
        """Получить ментора по email"""
        pass
    
    @abstractmethod
    def find_by_status(self, status: str) -> List[Mentor]:
        """Получить менторов по статусу"""
        pass
    
    @abstractmethod
    def create(self, mentor: Mentor) -> Mentor:
        """Создать ментора"""
        pass
    
    @abstractmethod
    def update(self, mentor: Mentor) -> Mentor:
        """Обновить ментора"""
        pass
    
    @abstractmethod
    def delete(self, mentor_id: str) -> bool:
        """Удалить ментора"""
        pass
    
    @abstractmethod
    def search(self, query: str) -> List[Mentor]:
        """Поиск менторов"""
        pass

