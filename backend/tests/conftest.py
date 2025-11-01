"""
Pytest Configuration and Fixtures
"""
import sys
from pathlib import Path

# Добавить корневую директорию в PYTHONPATH
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from core.database import Base, get_db
from core.app import app

# Тестовая база данных в памяти
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def db_session():
    """Создать тестовую сессию БД"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db_session):
    """Создать тестовый клиент FastAPI"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client, db_session):
    """Получить заголовки авторизации для тестового пользователя"""
    from modules.auth.infrastructure.database.models import User
    from modules.auth.infrastructure.security import get_password_hash
    
    # Создать тестового пользователя
    test_user = User(
        username="testadmin",
        email="admin@test.com",
        hashed_password=get_password_hash("testpass123"),
        role="MANAGER",
        is_active=True
    )
    db_session.add(test_user)
    db_session.commit()
    
    # Получить токен
    response = client.post(
        "/api/auth/login",
        json={"username": "testadmin", "password": "testpass123"}
    )
    
    assert response.status_code == 200
    token = response.json()["access_token"]
    
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_mentor(db_session):
    """Создать тестового ментора"""
    from modules.mentors.infrastructure.database.models import Mentor as MentorDB
    from datetime import date
    
    mentor = MentorDB(
        full_name="Иван Тестов",
        email="ivan@test.com",
        phone="+79991234567",
        specialization="Python Developer",
        hourly_rate=2500.0,
        status="ACTIVE",
        start_date=date(2024, 1, 1),
        passport_or_inn="1234567890",
        notes="Тестовый ментор"
    )
    db_session.add(mentor)
    db_session.commit()
    db_session.refresh(mentor)
    
    return mentor


@pytest.fixture
def test_work_record(db_session, test_mentor):
    """Создать тестовую запись о работе"""
    from modules.work_records.infrastructure.database.models import WorkRecord as WorkRecordDB
    from datetime import date
    
    work_record = WorkRecordDB(
        mentor_id=test_mentor.id,
        work_date=date(2024, 10, 15),
        category="Обучение",
        hours=5.0,
        description="Тестовое обучение"
    )
    db_session.add(work_record)
    db_session.commit()
    db_session.refresh(work_record)
    
    return work_record

