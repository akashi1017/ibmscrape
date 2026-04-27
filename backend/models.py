from sqlalchemy import Column, Integer, String, Text, DateTime, Numeric, JSON, ForeignKey, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column("hashed_password", String, nullable=False)
    role = Column(String, default="user", server_default="user", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("role IN ('user', 'admin')", name="user_role_check"),
    )

    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    # Full predicted number (multi-digit), stored as text to allow leading zeros
    predicted_value = Column(Text, nullable=False)
    # Average confidence across all digits in this prediction
    confidence = Column(Numeric(precision=5, scale=4), nullable=False)
    digit_count = Column(Integer, nullable=False, default=1, server_default="1")
    # Array of {digit, confidence} per detected digit, left-to-right
    per_digit_confidences = Column(JSON, nullable=True)
    image_path = Column(String, nullable=True)
    # Which model made this prediction: "resnet", "gemini", or "gemini_fallback"
    prediction_source = Column(String, default="resnet", server_default="resnet", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="predictions")
