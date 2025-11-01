"""
Work Record DTOs
Data Transfer Objects для записей о работе
"""

from pydantic import BaseModel, Field
from typing import Optional


class WorkRecordCreateDTO(BaseModel):
    """DTO для создания записи о работе"""
    mentorId: str
    date: str
    hours: float = Field(..., gt=0, le=24)
    description: str = Field(..., min_length=5)
    category: str = "other"
    status: str = "completed"
    notes: Optional[str] = None


class WorkRecordUpdateDTO(BaseModel):
    """DTO для обновления записи о работе"""
    date: Optional[str] = None
    hours: Optional[float] = Field(None, gt=0, le=24)
    description: Optional[str] = Field(None, min_length=5)
    category: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class WorkRecordResponseDTO(BaseModel):
    """DTO для ответа с записью о работе"""
    id: str
    mentorId: str
    date: str
    hours: float
    description: str
    category: str
    status: str
    notes: Optional[str] = None
    createdAt: str
    updatedAt: str
    
    class Config:
        from_attributes = True

