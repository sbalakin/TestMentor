"""
Create Test Users Script
Скрипт для создания тестовых пользователей
"""

from sqlalchemy.orm import Session

from core.database import SessionLocal, init_db
from modules.auth.infrastructure.repositories.user_repository import UserRepository
from modules.auth.infrastructure.database.models import UserRole


def create_test_users():
    """Создать тестовых пользователей"""
    print("=" * 60)
    print("🔐 Creating test users...")
    print("=" * 60)
    
    # Инициализация БД
    init_db()
    
    # Создание сессии
    db = SessionLocal()
    
    try:
        user_repo = UserRepository(db)
        
        # Проверка существующих пользователей
        existing_manager = user_repo.find_by_username("admin")
        if existing_manager:
            print("⚠️  Пользователь 'admin' уже существует")
        else:
            # Создать руководителя
            manager = user_repo.create(
                username="admin",
                email="admin@mentor.system",
                password="admin123",  # ВАЖНО: Изменить в production!
                full_name="Иванов Иван Иванович",
                role=UserRole.MANAGER.value
            )
            print(f"✅ Создан руководитель: {manager.username}")
            print(f"   Email: {manager.email}")
            print(f"   Password: admin123")
        
        # Создать ещё одного руководителя
        existing_manager2 = user_repo.find_by_username("manager")
        if existing_manager2:
            print("⚠️  Пользователь 'manager' уже существует")
        else:
            manager2 = user_repo.create(
                username="manager",
                email="manager@mentor.system",
                password="manager123",
                full_name="Петрова Мария Сергеевна",
                role=UserRole.MANAGER.value
            )
            print(f"✅ Создан руководитель: {manager2.username}")
            print(f"   Email: {manager2.email}")
            print(f"   Password: manager123")
        
        # Получить первых 5 менторов из БД
        from modules.mentors.infrastructure.database.models import MentorModel
        mentors = db.query(MentorModel).limit(5).all()
        
        if not mentors:
            print("\n⚠️  Нет менторов в БД! Запустите seed_data.py сначала.")
        else:
            print(f"\n📊 Найдено {len(mentors)} менторов для создания пользователей")
            
            # Создать пользователей для каждого ментора
            for i, mentor in enumerate(mentors, 1):
                username = f"mentor{i}"
                existing_mentor_user = user_repo.find_by_username(username)
                
                if existing_mentor_user:
                    print(f"⚠️  Пользователь '{username}' уже существует")
                else:
                    mentor_user = user_repo.create(
                        username=username,
                        email=f"mentor{i}@mentor.system",
                        password=f"mentor{i}123",
                        full_name=mentor.full_name,
                        role=UserRole.MENTOR.value,
                        mentor_id=mentor.id
                    )
                    print(f"✅ Создан ментор: {mentor_user.username}")
                    print(f"   Full Name: {mentor_user.full_name}")
                    print(f"   Email: {mentor_user.email}")
                    print(f"   Password: {username}123")
                    print(f"   Mentor ID: {mentor.id}")
        
        # Финальная статистика
        from modules.auth.infrastructure.database.models import UserModel
        total_users = db.query(UserModel).count()
        managers_count = db.query(UserModel).filter(UserModel.role == UserRole.MANAGER).count()
        mentors_count = db.query(UserModel).filter(UserModel.role == UserRole.MENTOR).count()
        
        print("\n" + "=" * 60)
        print("📊 Статистика пользователей:")
        print(f"  - Всего: {total_users}")
        print(f"  - Руководители: {managers_count}")
        print(f"  - Менторы: {mentors_count}")
        print("=" * 60)
        print("✅ Пользователи созданы!")
        print("\n🔑 Учетные данные для входа:")
        print("\nРУКОВОДИТЕЛИ:")
        print("  Username: admin    | Password: admin123")
        print("  Username: manager  | Password: manager123")
        print("\nМЕНТОРЫ:")
        print("  Username: mentor1  | Password: mentor1123")
        print("  Username: mentor2  | Password: mentor2123")
        print("  Username: mentor3  | Password: mentor3123")
        print("  Username: mentor4  | Password: mentor4123")
        print("  Username: mentor5  | Password: mentor5123")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    create_test_users()

