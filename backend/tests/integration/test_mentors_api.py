"""
Integration тесты для Mentors API
"""
import pytest
from datetime import date


class TestMentorsAPI:
    """Тесты API менторов"""
    
    def test_create_mentor(self, client, auth_headers):
        """Тест создания ментора"""
        response = client.post(
            "/api/mentors/",
            headers=auth_headers,
            json={
                "full_name": "Петр Петров",
                "email": "petr@test.com",
                "phone": "+79991234567",
                "specialization": "Python Developer",
                "hourly_rate": 3000.0,
                "status": "ACTIVE",
                "start_date": "2024-01-15"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["full_name"] == "Петр Петров"
        assert data["email"] == "petr@test.com"
        assert data["hourly_rate"] == 3000.0
        assert "id" in data
    
    def test_create_mentor_without_auth(self, client):
        """Тест создания ментора без авторизации"""
        response = client.post(
            "/api/mentors/",
            json={
                "full_name": "Test User",
                "email": "test@test.com",
                "specialization": "Developer",
                "hourly_rate": 2000.0,
                "start_date": "2024-01-01"
            }
        )
        
        assert response.status_code == 401
    
    def test_get_all_mentors(self, client, auth_headers, test_mentor):
        """Тест получения всех менторов"""
        response = client.get(
            "/api/mentors/",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert any(m["id"] == test_mentor.id for m in data)
    
    def test_get_mentor_by_id(self, client, auth_headers, test_mentor):
        """Тест получения ментора по ID"""
        response = client.get(
            f"/api/mentors/{test_mentor.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_mentor.id
        assert data["full_name"] == test_mentor.full_name
        assert data["email"] == test_mentor.email
    
    def test_get_nonexistent_mentor(self, client, auth_headers):
        """Тест получения несуществующего ментора"""
        response = client.get(
            "/api/mentors/nonexistent-id-12345",
            headers=auth_headers
        )
        
        assert response.status_code == 404
    
    def test_update_mentor(self, client, auth_headers, test_mentor):
        """Тест обновления ментора"""
        response = client.put(
            f"/api/mentors/{test_mentor.id}",
            headers=auth_headers,
            json={
                "full_name": "Иван Обновленный",
                "email": test_mentor.email,
                "specialization": "Senior Python Developer",
                "hourly_rate": 3500.0,
                "start_date": str(test_mentor.start_date)
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Иван Обновленный"
        assert data["specialization"] == "Senior Python Developer"
        assert data["hourly_rate"] == 3500.0
    
    def test_delete_mentor(self, client, auth_headers, test_mentor):
        """Тест удаления ментора"""
        mentor_id = test_mentor.id
        
        response = client.delete(
            f"/api/mentors/{mentor_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 204
        
        # Проверить что ментор действительно удален
        get_response = client.get(
            f"/api/mentors/{mentor_id}",
            headers=auth_headers
        )
        assert get_response.status_code == 404
    
    def test_create_mentor_invalid_email(self, client, auth_headers):
        """Тест создания ментора с невалидным email"""
        response = client.post(
            "/api/mentors/",
            headers=auth_headers,
            json={
                "full_name": "Test User",
                "email": "invalid-email",
                "specialization": "Developer",
                "hourly_rate": 2000.0,
                "start_date": "2024-01-01"
            }
        )
        
        assert response.status_code == 422
    
    def test_create_mentor_negative_rate(self, client, auth_headers):
        """Тест создания ментора с отрицательной ставкой"""
        response = client.post(
            "/api/mentors/",
            headers=auth_headers,
            json={
                "full_name": "Test User",
                "email": "test@test.com",
                "specialization": "Developer",
                "hourly_rate": -500.0,
                "start_date": "2024-01-01"
            }
        )
        
        assert response.status_code == 422

