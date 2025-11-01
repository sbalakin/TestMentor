"""
Unit тесты для модуля аутентификации
"""
import pytest
from modules.auth.infrastructure.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token
)


class TestPasswordHashing:
    """Тесты хеширования паролей"""
    
    def test_hash_password(self):
        """Тест хеширования пароля"""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        assert hashed != password
        assert len(hashed) > 0
    
    def test_verify_correct_password(self):
        """Тест проверки правильного пароля"""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        assert verify_password(password, hashed) is True
    
    def test_verify_incorrect_password(self):
        """Тест проверки неправильного пароля"""
        password = "testpassword123"
        wrong_password = "wrongpassword"
        hashed = get_password_hash(password)
        
        assert verify_password(wrong_password, hashed) is False
    
    def test_different_hashes_for_same_password(self):
        """Тест что одинаковые пароли дают разные хеши"""
        password = "testpassword123"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        assert hash1 != hash2
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True


class TestJWTTokens:
    """Тесты JWT токенов"""
    
    def test_create_access_token(self):
        """Тест создания JWT токена"""
        data = {"sub": "testuser"}
        token = create_access_token(data)
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_decode_valid_token(self):
        """Тест декодирования валидного токена"""
        data = {"sub": "testuser", "role": "MANAGER"}
        token = create_access_token(data)
        
        decoded = decode_access_token(token)
        
        assert decoded is not None
        assert decoded["sub"] == "testuser"
        assert decoded["role"] == "MANAGER"
    
    def test_decode_invalid_token(self):
        """Тест декодирования невалидного токена"""
        invalid_token = "invalid.token.here"
        
        decoded = decode_access_token(invalid_token)
        
        assert decoded is None
    
    def test_token_contains_expiration(self):
        """Тест что токен содержит время истечения"""
        data = {"sub": "testuser"}
        token = create_access_token(data)
        
        decoded = decode_access_token(token)
        
        assert "exp" in decoded
        assert decoded["exp"] > 0

