"""
Mentor DTOs
Data Transfer Objects для менторов
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class MentorCreateDTO(BaseModel):
    """DTO для создания ментора"""
    fullName: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    photoUrl: Optional[str] = None
    specialization: str = Field(..., min_length=2)
    hourlyRate: float = Field(..., gt=0)
    startDate: str
    status: str = "active"
    passportOrInn: Optional[str] = None
    bankDetails: Optional[str] = None
    notes: Optional[str] = None


class MentorUpdateDTO(BaseModel):
    """DTO для обновления ментора"""
    fullName: Optional[str] = Field(None, min_length=3, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    photoUrl: Optional[str] = None
    specialization: Optional[str] = Field(None, min_length=2)
    hourlyRate: Optional[float] = Field(None, gt=0)
    startDate: Optional[str] = None
    status: Optional[str] = None
    passportOrInn: Optional[str] = None
    bankDetails: Optional[str] = None
    notes: Optional[str] = None


class MentorResponseDTO(BaseModel):
    """DTO для ответа с ментором"""
    id: str
    fullName: str
    email: str
    phone: Optional[str] = None
    photoUrl: Optional[str] = None
    specialization: str
    hourlyRate: float
    startDate: str
    status: str
    passportOrInn: Optional[str] = None
    bankDetails: Optional[str] = None
    notes: Optional[str] = None
    createdAt: str
    updatedAt: str
    
    class Config:
        from_attributes = True

