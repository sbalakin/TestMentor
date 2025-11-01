"""
Core Database
Подключение к базе данных и управление сессиями
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from core.config import settings


# Создание движка БД
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    echo=settings.DEBUG
)

# Фабрика сессий
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для моделей
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency для получения сессии БД в FastAPI
    
    Yields:
        Session: Сессия базы данных
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Инициализация базы данных
    Создание всех таблиц
    """
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")


def drop_db() -> None:
    """
    Удаление всех таблиц (для разработки)
    """
    Base.metadata.drop_all(bind=engine)
    print("🗑️ Database tables dropped")

