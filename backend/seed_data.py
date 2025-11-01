"""
Seed Data Script
Скрипт для заполнения БД тестовыми данными
"""

import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from core.database import SessionLocal, init_db
from modules.mentors.infrastructure.database.models import MentorModel, MentorStatus
from modules.work_records.infrastructure.database.models import WorkRecordModel


# Данные для генерации
FIRST_NAMES = [
    "Александр", "Дмитрий", "Максим", "Сергей", "Андрей",
    "Алексей", "Артём", "Илья", "Кирилл", "Михаил",
    "Никита", "Матвей", "Роман", "Владимир", "Егор",
    "Мария", "Анна", "Екатерина", "Наталья", "Ольга",
    "Татьяна", "Елена", "Ирина", "Светлана", "Юлия"
]

LAST_NAMES = [
    "Иванов", "Петров", "Сидоров", "Смирнов", "Козлов",
    "Васильев", "Попов", "Соколов", "Лебедев", "Новиков",
    "Морозов", "Волков", "Алексеев", "Николаев", "Федоров",
    "Михайлов", "Павлов", "Александров", "Кузнецов", "Степанов",
    "Иванова", "Петрова", "Сидорова", "Смирнова", "Козлова"
]

MIDDLE_NAMES = [
    "Александрович", "Дмитриевич", "Максимович", "Сергеевич", "Андреевич",
    "Алексеевич", "Артёмович", "Ильич", "Кириллович", "Михайлович",
    "Александровна", "Дмитриевна", "Максимовна", "Сергеевна", "Андреевна"
]

SPECIALIZATIONS = [
    "Разработка ботов",
    "Python разработка",
    "Web разработка",
    "JavaScript обучение",
    "Системный дизайн",
    "DevOps консультации",
    "Machine Learning",
    "Data Science",
    "Mobile разработка",
    "Backend разработка",
    "Frontend разработка",
    "Fullstack разработка",
    "Database проектирование",
    "Cloud архитектура",
    "Тестирование ПО"
]

WORK_CATEGORIES = ["mentoring", "development", "consulting", "other"]

WORK_DESCRIPTIONS = [
    "Обучение основам Python и ООП",
    "Разработка Telegram бота для автоматизации",
    "Консультация по архитектуре микросервисов",
    "Code review и рефакторинг кода",
    "Настройка CI/CD pipeline",
    "Обучение React и современным frontend фреймворкам",
    "Помощь с оптимизацией SQL запросов",
    "Разработка REST API на FastAPI",
    "Обучение работе с Docker и Kubernetes",
    "Консультация по паттернам проектирования",
    "Разработка системы аутентификации",
    "Обучение Git и GitHub workflow",
    "Помощь с подготовкой к техническому собеседованию",
    "Разработка системы мониторинга",
    "Обучение работе с базами данных",
    "Настройка production окружения",
    "Код-ревью Pull Request",
    "Разработка админ-панели",
    "Обучение Clean Architecture",
    "Консультация по безопасности приложений"
]


def generate_mentor_id():
    """Генерация ID ментора"""
    import uuid
    return f"mentor_{uuid.uuid4().hex[:12]}"


def generate_work_id():
    """Генерация ID записи о работе"""
    import uuid
    return f"work_{uuid.uuid4().hex[:12]}"


def create_mentors(db: Session, count: int = 30):
    """Создать тестовых менторов"""
    print(f"Creating {count} mentors...")
    
    mentors = []
    for i in range(count):
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        middle_name = random.choice(MIDDLE_NAMES)
        
        full_name = f"{last_name} {first_name} {middle_name}"
        email = f"{last_name.lower()}.{first_name.lower()}{i}@example.com"
        phone = f"+7 (9{random.randint(10, 99)}) {random.randint(100, 999)}-{random.randint(10, 99)}-{random.randint(10, 99)}"
        specialization = random.choice(SPECIALIZATIONS)
        hourly_rate = random.choice([500, 800, 1000, 1200, 1500, 2000, 2500, 3000])
        
        # Дата начала работы в пределах последних 2 лет
        days_ago = random.randint(30, 730)
        start_date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
        
        # 80% активных, 20% неактивных
        status = MentorStatus.ACTIVE if random.random() < 0.8 else MentorStatus.INACTIVE
        
        mentor = MentorModel(
            id=generate_mentor_id(),
            full_name=full_name,
            email=email,
            phone=phone,
            specialization=specialization,
            hourly_rate=hourly_rate,
            start_date=start_date,
            status=status,
            passport_or_inn=f"{random.randint(1000, 9999)} {random.randint(100000, 999999)}",
            notes=f"Опытный специалист в области {specialization.lower()}" if random.random() > 0.5 else None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        mentors.append(mentor)
        db.add(mentor)
    
    db.commit()
    print(f"✅ Created {count} mentors")
    return mentors


def create_work_records(db: Session, mentors: list, count: int = 100):
    """Создать тестовые записи о работе"""
    print(f"Creating {count} work records...")
    
    # Только активные менторы
    active_mentors = [m for m in mentors if m.status == MentorStatus.ACTIVE]
    
    if not active_mentors:
        print("⚠️ No active mentors found!")
        return
    
    work_records = []
    
    for i in range(count):
        mentor = random.choice(active_mentors)
        
        # Дата работы в пределах последних 6 месяцев
        days_ago = random.randint(1, 180)
        work_date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
        
        # Часы работы: от 1 до 12 часов
        hours = random.choice([1, 2, 3, 4, 5, 6, 7, 8, 10, 12]) + random.random()
        hours = round(hours, 1)
        
        description = random.choice(WORK_DESCRIPTIONS)
        category = random.choice(WORK_CATEGORIES)
        
        work_record = WorkRecordModel(
            id=generate_work_id(),
            mentor_id=mentor.id,
            date=work_date,
            hours=hours,
            description=description,
            category=category,
            status="completed",
            notes=f"Работа завершена успешно" if random.random() > 0.7 else None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        work_records.append(work_record)
        db.add(work_record)
    
    db.commit()
    print(f"✅ Created {count} work records")
    return work_records


def main():
    """Главная функция"""
    print("=" * 60)
    print("🌱 Seeding database with test data...")
    print("=" * 60)
    
    # Инициализация БД
    init_db()
    
    # Создание сессии
    db = SessionLocal()
    
    try:
        # Проверка существующих данных
        existing_mentors = db.query(MentorModel).count()
        existing_work_records = db.query(WorkRecordModel).count()
        
        print(f"\n📊 Current data:")
        print(f"  - Mentors: {existing_mentors}")
        print(f"  - Work Records: {existing_work_records}")
        
        if existing_mentors > 0 or existing_work_records > 0:
            print("\n⚠️  Database already contains data!")
            response = input("Do you want to add more data? (yes/no): ")
            if response.lower() not in ['yes', 'y', 'да', 'д']:
                print("❌ Seeding cancelled")
                return
        
        print("\n" + "=" * 60)
        
        # Создание менторов
        mentors = create_mentors(db, count=30)
        
        # Создание записей о работе
        create_work_records(db, mentors, count=100)
        
        # Финальная статистика
        total_mentors = db.query(MentorModel).count()
        total_work_records = db.query(WorkRecordModel).count()
        active_mentors = db.query(MentorModel).filter(MentorModel.status == MentorStatus.ACTIVE).count()
        
        print("\n" + "=" * 60)
        print("📊 Final statistics:")
        print(f"  - Total Mentors: {total_mentors}")
        print(f"  - Active Mentors: {active_mentors}")
        print(f"  - Total Work Records: {total_work_records}")
        print("=" * 60)
        print("✅ Database seeded successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()

