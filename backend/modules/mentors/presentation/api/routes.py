"""
Mentors API Routes with Auth
REST API эндпоинты для менторов с авторизацией
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from core.database import get_db
from modules.auth.presentation.api.dependencies import get_current_user
from modules.auth.domain.entities.user import User, UserRole
from modules.mentors.application.dto.mentor_dto import (
    MentorCreateDTO,
    MentorUpdateDTO,
    MentorResponseDTO
)
from modules.mentors.application.use_cases.create_mentor import CreateMentorUseCase
from modules.mentors.application.use_cases.get_mentors import GetMentorsUseCase
from modules.mentors.application.use_cases.update_mentor import UpdateMentorUseCase
from modules.mentors.application.use_cases.delete_mentor import DeleteMentorUseCase
from modules.mentors.infrastructure.repositories.mentor_repository_impl import MentorRepository


router = APIRouter()


@router.get("/", response_model=List[MentorResponseDTO])
def get_mentors(
    status: Optional[str] = Query(None, description="Фильтр по статусу"),
    search: Optional[str] = Query(None, description="Поисковый запрос"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Получить список менторов
    - Руководитель видит всех
    - Ментор видит только себя
    """
    repository = MentorRepository(db)
    use_case = GetMentorsUseCase(repository)
    
    mentors = use_case.execute(status=status, search=search)
    
    # Фильтрация по правам
    if current_user.role == UserRole.MENTOR:
        mentors = [m for m in mentors if m.id == current_user.mentor_id]
    
    return [
        MentorResponseDTO(
            id=m.id,
            fullName=m.full_name,
            email=m.email,
            phone=m.phone,
            photoUrl=m.photo_url,
            specialization=m.specialization,
            hourlyRate=m.hourly_rate,
            startDate=m.start_date,
            status=m.status,
            passportOrInn=m.passport_or_inn,
            bankDetails=m.bank_details,
            notes=m.notes,
            createdAt=m.created_at.isoformat(),
            updatedAt=m.updated_at.isoformat()
        )
        for m in mentors
    ]


@router.get("/{mentor_id}", response_model=MentorResponseDTO)
def get_mentor(
    mentor_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Получить ментора по ID
    - Руководитель видит любого
    - Ментор видит только себя
    """
    # Проверка прав
    if current_user.role == UserRole.MENTOR and current_user.mentor_id != mentor_id:
        raise HTTPException(status_code=403, detail="Доступ запрещен")
    
    repository = MentorRepository(db)
    use_case = GetMentorsUseCase(repository)
    
    mentor = use_case.get_by_id(mentor_id)
    if not mentor:
        raise HTTPException(status_code=404, detail="Ментор не найден")
    
    return MentorResponseDTO(
        id=mentor.id,
        fullName=mentor.full_name,
        email=mentor.email,
        phone=mentor.phone,
        photoUrl=mentor.photo_url,
        specialization=mentor.specialization,
        hourlyRate=mentor.hourly_rate,
        startDate=mentor.start_date,
        status=mentor.status,
        passportOrInn=mentor.passport_or_inn,
        bankDetails=mentor.bank_details,
        notes=mentor.notes,
        createdAt=mentor.created_at.isoformat(),
        updatedAt=mentor.updated_at.isoformat()
    )


@router.post("/", response_model=MentorResponseDTO, status_code=201)
def create_mentor(
    dto: MentorCreateDTO,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Создать нового ментора (только руководитель)
    """
    # Только руководитель может создавать
    if current_user.role != UserRole.MANAGER:
        raise HTTPException(status_code=403, detail="Доступ запрещен. Требуется роль руководителя.")
    
    repository = MentorRepository(db)
    use_case = CreateMentorUseCase(repository)
    
    try:
        mentor = use_case.execute(dto)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    return MentorResponseDTO(
        id=mentor.id,
        fullName=mentor.full_name,
        email=mentor.email,
        phone=mentor.phone,
        photoUrl=mentor.photo_url,
        specialization=mentor.specialization,
        hourlyRate=mentor.hourly_rate,
        startDate=mentor.start_date,
        status=mentor.status,
        passportOrInn=mentor.passport_or_inn,
        bankDetails=mentor.bank_details,
        notes=mentor.notes,
        createdAt=mentor.created_at.isoformat(),
        updatedAt=mentor.updated_at.isoformat()
    )


@router.put("/{mentor_id}", response_model=MentorResponseDTO)
def update_mentor(
    mentor_id: str,
    dto: MentorUpdateDTO,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Обновить ментора
    - Руководитель может обновлять любого
    - Ментор может обновлять только себя
    """
    # Проверка прав
    if current_user.role == UserRole.MENTOR and current_user.mentor_id != mentor_id:
        raise HTTPException(status_code=403, detail="Доступ запрещен")
    
    repository = MentorRepository(db)
    use_case = UpdateMentorUseCase(repository)
    
    try:
        mentor = use_case.execute(mentor_id, dto)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    return MentorResponseDTO(
        id=mentor.id,
        fullName=mentor.full_name,
        email=mentor.email,
        phone=mentor.phone,
        photoUrl=mentor.photo_url,
        specialization=mentor.specialization,
        hourlyRate=mentor.hourly_rate,
        startDate=mentor.start_date,
        status=mentor.status,
        passportOrInn=mentor.passport_or_inn,
        bankDetails=mentor.bank_details,
        notes=mentor.notes,
        createdAt=mentor.created_at.isoformat(),
        updatedAt=mentor.updated_at.isoformat()
    )


@router.delete("/{mentor_id}", status_code=204)
def delete_mentor(
    mentor_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Удалить ментора (только руководитель)
    """
    # Только руководитель может удалять
    if current_user.role != UserRole.MANAGER:
        raise HTTPException(status_code=403, detail="Доступ запрещен. Требуется роль руководителя.")
    
    repository = MentorRepository(db)
    use_case = DeleteMentorUseCase(repository)
    
    deleted = use_case.execute(mentor_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Ментор не найден")
    
    return None

