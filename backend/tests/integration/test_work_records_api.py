"""
Integration тесты для Work Records API
"""
import pytest
from datetime import date


class TestWorkRecordsAPI:
    """Тесты API записей о работе"""
    
    def test_create_work_record(self, client, auth_headers, test_mentor):
        """Тест создания записи о работе"""
        response = client.post(
            "/api/work-records/",
            headers=auth_headers,
            json={
                "mentor_id": test_mentor.id,
                "work_date": "2024-10-20",
                "category": "Обучение",
                "hours": 4.5,
                "description": "Обучение Python"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["mentor_id"] == test_mentor.id
        assert data["category"] == "Обучение"
        assert data["hours"] == 4.5
        assert "id" in data
    
    def test_create_work_record_without_description(self, client, auth_headers, test_mentor):
        """Тест создания записи без описания"""
        response = client.post(
            "/api/work-records/",
            headers=auth_headers,
            json={
                "mentor_id": test_mentor.id,
                "work_date": "2024-10-20",
                "category": "Консультация",
                "hours": 2.0
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["description"] is None or data["description"] == ""
    
    def test_get_all_work_records(self, client, auth_headers, test_work_record):
        """Тест получения всех записей"""
        response = client.get(
            "/api/work-records/",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    def test_get_work_records_by_mentor(self, client, auth_headers, test_mentor, test_work_record):
        """Тест получения записей по ментору"""
        response = client.get(
            f"/api/work-records/?mentor_id={test_mentor.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert all(record["mentor_id"] == test_mentor.id for record in data)
    
    def test_get_work_record_by_id(self, client, auth_headers, test_work_record):
        """Тест получения записи по ID"""
        response = client.get(
            f"/api/work-records/{test_work_record.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_work_record.id
        assert data["mentor_id"] == test_work_record.mentor_id
    
    def test_update_work_record(self, client, auth_headers, test_work_record):
        """Тест обновления записи"""
        response = client.put(
            f"/api/work-records/{test_work_record.id}",
            headers=auth_headers,
            json={
                "mentor_id": test_work_record.mentor_id,
                "work_date": str(test_work_record.work_date),
                "category": "Разработка",
                "hours": 8.0,
                "description": "Обновленное описание"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["category"] == "Разработка"
        assert data["hours"] == 8.0
        assert data["description"] == "Обновленное описание"
    
    def test_delete_work_record(self, client, auth_headers, test_work_record):
        """Тест удаления записи"""
        record_id = test_work_record.id
        
        response = client.delete(
            f"/api/work-records/{record_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 204
        
        # Проверить что запись удалена
        get_response = client.get(
            f"/api/work-records/{record_id}",
            headers=auth_headers
        )
        assert get_response.status_code == 404
    
    def test_create_work_record_invalid_hours(self, client, auth_headers, test_mentor):
        """Тест создания записи с невалидными часами"""
        response = client.post(
            "/api/work-records/",
            headers=auth_headers,
            json={
                "mentor_id": test_mentor.id,
                "work_date": "2024-10-20",
                "category": "Обучение",
                "hours": -2.0  # Отрицательные часы
            }
        )
        
        assert response.status_code == 422
    
    def test_create_work_record_nonexistent_mentor(self, client, auth_headers):
        """Тест создания записи для несуществующего ментора"""
        response = client.post(
            "/api/work-records/",
            headers=auth_headers,
            json={
                "mentor_id": "nonexistent-mentor-id",
                "work_date": "2024-10-20",
                "category": "Обучение",
                "hours": 3.0
            }
        )
        
        assert response.status_code in [404, 422]

