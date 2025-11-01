"""
Work Records API Routes with Auth
REST API эндпоинты для записей о работе с авторизацией
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from core.database import get_db
from modules.auth.presentation.api.dependencies import get_current_user
from modules.auth.domain.entities.user import User, UserRole
from modules.work_records.application.dto.work_record_dto import (
    WorkRecordCreateDTO,
    WorkRecordUpdateDTO,
    WorkRecordResponseDTO
)
from modules.work_records.application.use_cases.create_work_record import CreateWorkRecordUseCase
from modules.work_records.infrastructure.repositories.work_record_repository_impl import WorkRecordRepository


router = APIRouter()


@router.get("/", response_model=List[WorkRecordResponseDTO])
def get_work_records(
    mentor_id: Optional[str] = Query(None, description="Фильтр по ментору"),
    start_date: Optional[str] = Query(None, description="Начальная дата"),
    end_date: Optional[str] = Query(None, description="Конечная дата"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Получить записи о работе
    - Руководитель видит все записи
    - Ментор видит только свои записи
    """
    repository = WorkRecordRepository(db)
    
    # Если ментор - принудительно фильтруем только его записи
    if current_user.role == UserRole.MENTOR:
        mentor_id = current_user.mentor_id
    
    # Получение записей
    if mentor_id:
        records = repository.find_by_mentor(mentor_id)
    elif start_date and end_date:
        records = repository.find_by_date_range(start_date, end_date)
    else:
        records = repository.find_all()
    
    # Дополнительная фильтрация для ментора
    if current_user.role == UserRole.MENTOR:
        records = [r for r in records if r.mentor_id == current_user.mentor_id]
    
    return [
        WorkRecordResponseDTO(
            id=r.id,
            mentorId=r.mentor_id,
            date=r.date,
            hours=r.hours,
            description=r.description,
            category=r.category,
            status=r.status,
            notes=r.notes,
            createdAt=r.created_at.isoformat(),
            updatedAt=r.updated_at.isoformat()
        )
        for r in records
    ]


@router.get("/{record_id}", response_model=WorkRecordResponseDTO)
def get_work_record(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Получить запись о работе по ID
    - Руководитель видит любую
    - Ментор видит только свои
    """
    repository = WorkRecordRepository(db)
    record = repository.find_by_id(record_id)
    
    if not record:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    
    # Проверка прав
    if current_user.role == UserRole.MENTOR and record.mentor_id != current_user.mentor_id:
        raise HTTPException(status_code=403, detail="Доступ запрещен")
    
    return WorkRecordResponseDTO(
        id=record.id,
        mentorId=record.mentor_id,
        date=record.date,
        hours=record.hours,
        description=record.description,
        category=record.category,
        status=record.status,
        notes=record.notes,
        createdAt=record.created_at.isoformat(),
        updatedAt=record.updated_at.isoformat()
    )


@router.post("/", response_model=WorkRecordResponseDTO, status_code=201)
def create_work_record(
    dto: WorkRecordCreateDTO,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Создать запись о работе
    - Руководитель может создавать для любого ментора
    - Ментор может создавать только для себя
    """
    # Если ментор - проверяем что создает для себя
    if current_user.role == UserRole.MENTOR:
        if dto.mentorId != current_user.mentor_id:
            raise HTTPException(status_code=403, detail="Можно создавать записи только для себя")
    
    repository = WorkRecordRepository(db)
    use_case = CreateWorkRecordUseCase(repository)
    
    try:
        record = use_case.execute(dto)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    return WorkRecordResponseDTO(
        id=record.id,
        mentorId=record.mentor_id,
        date=record.date,
        hours=record.hours,
        description=record.description,
        category=record.category,
        status=record.status,
        notes=record.notes,
        createdAt=record.created_at.isoformat(),
        updatedAt=record.updated_at.isoformat()
    )


@router.delete("/{record_id}", status_code=204)
def delete_work_record(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Удалить запись о работе
    - Руководитель может удалять любые записи
    - Ментор может удалять только свои
    """
    repository = WorkRecordRepository(db)
    record = repository.find_by_id(record_id)
    
    if not record:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    
    # Проверка прав
    if current_user.role == UserRole.MENTOR and record.mentor_id != current_user.mentor_id:
        raise HTTPException(status_code=403, detail="Доступ запрещен")
    
    deleted = repository.delete(record_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    
    return None

