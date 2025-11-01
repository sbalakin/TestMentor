"""
Mentors API Routes
REST API эндпоинты для менторов
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from core.database import get_db
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
    db: Session = Depends(get_db)
):
    """
    Получить список всех менторов
    
    - **status**: Фильтр по статусу (active/inactive)
    - **search**: Поиск по имени, email, специализации
    """
    repository = MentorRepository(db)
    use_case = GetMentorsUseCase(repository)
    
    mentors = use_case.execute(status=status, search=search)
    
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
def get_mentor(mentor_id: str, db: Session = Depends(get_db)):
    """
    Получить ментора по ID
    """
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
def create_mentor(dto: MentorCreateDTO, db: Session = Depends(get_db)):
    """
    Создать нового ментора
    """
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
    db: Session = Depends(get_db)
):
    """
    Обновить ментора
    """
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
def delete_mentor(mentor_id: str, db: Session = Depends(get_db)):
    """
    Удалить ментора
    """
    repository = MentorRepository(db)
    use_case = DeleteMentorUseCase(repository)
    
    deleted = use_case.execute(mentor_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Ментор не найден")
    
    return None

