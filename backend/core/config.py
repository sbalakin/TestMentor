"""
Core Configuration
Централизованная конфигурация приложения
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Настройки приложения"""
    
    # Database
    DATABASE_URL: str = "sqlite:///./mentor_system.db"
    
    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8001
    API_RELOAD: bool = True
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:8000,http://127.0.0.1:8000"
    
    # App
    APP_NAME: str = "Mentor System API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Получить список CORS origins"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


# Глобальный экземпляр настроек
settings = Settings()

