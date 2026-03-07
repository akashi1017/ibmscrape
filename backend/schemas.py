from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import Optional, Dict
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

class PredictionBase(BaseModel):
    predicted_digit: int
    confidence: float
    image_path: Optional[str] = None
    raw_scores: Optional[Dict] = None

class PredictionCreate(PredictionBase):
    pass

class PredictionResponse(PredictionBase):
    id: int
    user_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class PredictionResponseAdmin(PredictionResponse):
    user_name: str
    user_email: str
