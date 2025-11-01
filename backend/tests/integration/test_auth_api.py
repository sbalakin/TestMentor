"""
Integration тесты для Auth API
"""
import pytest


class TestAuthAPI:
    """Тесты API аутентификации"""
    
    def test_register_new_user(self, client, db_session):
        """Тест регистрации нового пользователя"""
        response = client.post(
            "/api/auth/register",
            json={
                "username": "newuser",
                "email": "newuser@test.com",
                "password": "newpass123",
                "role": "MANAGER"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "newuser"
        assert data["email"] == "newuser@test.com"
        assert data["role"] == "MANAGER"
        assert "id" in data
    
    def test_register_duplicate_username(self, client, db_session):
        """Тест регистрации с дублирующимся username"""
        # Первая регистрация
        client.post(
            "/api/auth/register",
            json={
                "username": "duplicate",
                "email": "user1@test.com",
                "password": "pass123",
                "role": "MANAGER"
            }
        )
        
        # Попытка повторной регистрации
        response = client.post(
            "/api/auth/register",
            json={
                "username": "duplicate",
                "email": "user2@test.com",
                "password": "pass456",
                "role": "MANAGER"
            }
        )
        
        assert response.status_code == 400
        assert "username" in response.json()["detail"].lower()
    
    def test_login_success(self, client, db_session):
        """Тест успешного входа"""
        # Регистрация
        client.post(
            "/api/auth/register",
            json={
                "username": "logintest",
                "email": "login@test.com",
                "password": "testpass123",
                "role": "MANAGER"
            }
        )
        
        # Вход
        response = client.post(
            "/api/auth/login",
            json={
                "username": "logintest",
                "password": "testpass123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["user"]["username"] == "logintest"
    
    def test_login_wrong_password(self, client, db_session):
        """Тест входа с неправильным паролем"""
        # Регистрация
        client.post(
            "/api/auth/register",
            json={
                "username": "wrongpass",
                "email": "wrong@test.com",
                "password": "correctpass",
                "role": "MANAGER"
            }
        )
        
        # Попытка входа с неправильным паролем
        response = client.post(
            "/api/auth/login",
            json={
                "username": "wrongpass",
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()
    
    def test_login_nonexistent_user(self, client):
        """Тест входа несуществующего пользователя"""
        response = client.post(
            "/api/auth/login",
            json={
                "username": "nonexistent",
                "password": "anypassword"
            }
        )
        
        assert response.status_code == 401
    
    def test_get_current_user(self, client, auth_headers):
        """Тест получения текущего пользователя"""
        response = client.get(
            "/api/auth/me",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "username" in data
        assert "email" in data
        assert "role" in data
    
    def test_get_current_user_without_token(self, client):
        """Тест получения пользователя без токена"""
        response = client.get("/api/auth/me")
        
        assert response.status_code == 401
    
    def test_get_current_user_invalid_token(self, client):
        """Тест получения пользователя с невалидным токеном"""
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid_token_here"}
        )
        
        assert response.status_code == 401

