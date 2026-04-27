from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import Optional, Dict, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str = Field(min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str

class TokenData(BaseModel):
    email: Optional[str] = None


class DigitResult(BaseModel):
    """One detected digit, left-to-right within a multi-digit image."""
    digit: int
    confidence: float


class PredictionResponse(BaseModel):
    """Multi-digit prediction record returned to clients."""
    id: int
    user_id: int
    predicted_value: str
    confidence: float
    digit_count: int
    per_digit_confidences: Optional[List[DigitResult]] = None
    image_path: Optional[str] = None
    prediction_source: Optional[str] = "resnet"  # "resnet", "gemini", or "gemini_fallback"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PredictionResponseAdmin(PredictionResponse):
    user_name: str
    user_email: str


class PredictionCreateResponse(BaseModel):
    """Response from POST /api/predict — newly created prediction."""
    id: int
    predicted_value: str
    confidence: float
    digit_count: int
    per_digit_confidences: List[DigitResult]
    image_path: Optional[str] = None
    prediction_source: str = "resnet"  # "resnet", "gemini", or "gemini_fallback"
    created_at: datetime


class UserStats(BaseModel):
    prediction_count: int
    avg_confidence: float
    last_prediction: Optional[PredictionResponse] = None
