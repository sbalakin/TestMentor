"""
Auth API Routes
REST API endpoints для аутентификации
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from modules.auth.application.dto.auth_dto import LoginRequest, LoginResponse, RegisterRequest
from modules.auth.application.use_cases.login import LoginUseCase
from modules.auth.application.use_cases.ldap_login import LdapLoginUseCase
from modules.auth.infrastructure.repositories.user_repository import UserRepository
from modules.auth.presentation.api.dependencies import get_current_user, get_current_manager
from modules.auth.domain.entities.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Логин пользователя
    
    - **username**: Имя пользователя
    - **password**: Пароль
    """
    use_case = LoginUseCase(db)
    result = use_case.execute(request.username, request.password)
    
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверные учетные данные",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return result


@router.post("/ldap/login", response_model=LoginResponse)
async def ldap_login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    LDAP логин пользователя через корпоративный LDAP сервер
    
    - **username**: Email пользователя из LDAP
    - **password**: Пароль пользователя LDAP
    
    После успешной авторизации в LDAP:
    - Создается локальный пользователь (если не существует)
    - Возвращается JWT токен для доступа к API
    """
    use_case = LdapLoginUseCase(db)
    
    # Используем username как email для LDAP
    result = use_case.execute(request.username, request.password)
    
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверные учетные данные LDAP",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return result


@router.post("/register", response_model=dict, dependencies=[Depends(get_current_manager)])
async def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Регистрация нового пользователя (только для руководителей)
    
    - **username**: Имя пользователя (уникальное)
    - **email**: Email (уникальный)
    - **password**: Пароль
    - **full_name**: Полное имя
    - **role**: Роль (MANAGER или MENTOR)
    - **mentor_id**: ID ментора (если роль MENTOR)
    """
    user_repo = UserRepository(db)
    
    # Проверить существование
    if user_repo.find_by_username(request.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким username уже существует"
        )
    
    if user_repo.find_by_email(request.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким email уже существует"
        )
    
    # Создать пользователя
    user = user_repo.create(
        username=request.username,
        email=request.email,
        password=request.password,
        full_name=request.full_name,
        role=request.role,
        mentor_id=request.mentor_id
    )
    
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role.value,
        "message": "Пользователь успешно создан"
    }


@router.get("/me", response_model=dict)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    """
    Получить информацию о текущем пользователе
    """
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "mentor_id": current_user.mentor_id,
        "is_active": current_user.is_active
    }

