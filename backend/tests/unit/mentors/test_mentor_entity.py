"""
Unit тесты для сущности Mentor
"""
import pytest
from modules.mentors.domain.entities.mentor import Mentor


class TestMentorEntity:
    """Тесты доменной сущности Mentor"""
    
    def test_create_mentor(self):
        """Тест создания ментора"""
        mentor = Mentor(
            id="test-id-123",
            full_name="Иван Иванов",
            email="ivan@test.com",
            phone="+79991234567",
            specialization="Python Developer",
            hourly_rate=2500.0,
            status="active",
            start_date="2024-01-01"
        )
        
        assert mentor.id == "test-id-123"
        assert mentor.full_name == "Иван Иванов"
        assert mentor.email == "ivan@test.com"
        assert mentor.hourly_rate == 2500.0
        assert mentor.status == "active"
    
    def test_mentor_default_status(self):
        """Тест дефолтного статуса ментора"""
        mentor = Mentor(
            id="test-id",
            full_name="Test User",
            email="test@test.com",
            specialization="Developer",
            hourly_rate=2000.0,
            start_date="2024-01-01"
        )
        
        assert mentor.status == "active"
    
    def test_mentor_optional_fields(self):
        """Тест опциональных полей"""
        mentor = Mentor(
            id="test-id",
            full_name="Test User",
            email="test@test.com",
            specialization="Developer",
            hourly_rate=2000.0,
            start_date="2024-01-01",
            phone=None,
            passport_or_inn=None,
            notes=None
        )
        
        assert mentor.phone is None
        assert mentor.passport_or_inn is None
        assert mentor.notes is None
    
    def test_mentor_with_all_fields(self):
        """Тест ментора со всеми полями"""
        mentor = Mentor(
            id="test-id",
            full_name="Иван Иванов",
            email="ivan@test.com",
            phone="+79991234567",
            specialization="Python Developer",
            hourly_rate=2500.0,
            status="active",
            start_date="2024-01-01",
            passport_or_inn="1234567890",
            notes="Отличный специалист"
        )
        
        assert mentor.passport_or_inn == "1234567890"
        assert mentor.notes == "Отличный специалист"
    
    def test_mentor_inactive_status(self):
        """Тест неактивного ментора"""
        mentor = Mentor(
            id="test-id",
            full_name="Test User",
            email="test@test.com",
            specialization="Developer",
            hourly_rate=2000.0,
            start_date="2024-01-01",
            status="inactive"
        )
        
        assert mentor.status == "inactive"

