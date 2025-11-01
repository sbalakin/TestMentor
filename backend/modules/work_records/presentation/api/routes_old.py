"""
Work Records API Routes
REST API эндпоинты для записей о работе
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from core.database import get_db
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
    db: Session = Depends(get_db)
):
    """
    Получить список всех записей о работе
    
    - **mentor_id**: Фильтр по ID ментора
    - **start_date**: Фильтр по дате (начало)
    - **end_date**: Фильтр по дате (конец)
    """
    repository = WorkRecordRepository(db)
    
    if mentor_id:
        records = repository.find_by_mentor(mentor_id)
    elif start_date and end_date:
        records = repository.find_by_date_range(start_date, end_date)
    else:
        records = repository.find_all()
    
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
def get_work_record(record_id: str, db: Session = Depends(get_db)):
    """
    Получить запись о работе по ID
    """
    repository = WorkRecordRepository(db)
    record = repository.find_by_id(record_id)
    
    if not record:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    
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
def create_work_record(dto: WorkRecordCreateDTO, db: Session = Depends(get_db)):
    """
    Создать новую запись о работе
    """
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
def delete_work_record(record_id: str, db: Session = Depends(get_db)):
    """
    Удалить запись о работе
    """
    repository = WorkRecordRepository(db)
    deleted = repository.delete(record_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    
    return None

