from sqlalchemy import Column, Integer, String, DateTime, SmallInteger, Numeric, JSON, ForeignKey, CheckConstraint
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
    predicted_digit = Column(SmallInteger, nullable=False)
    confidence = Column(Numeric(precision=5, scale=4), nullable=False)
    image_path = Column(String, nullable=True)
    raw_scores = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="predictions")
