import os
import uuid
import shutil
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from backend import schemas, models, utils
from backend.database import get_db
# Import model predict component
from backend.model import predict

router = APIRouter()
UPLOAD_DIR = "uploads"

# Ensure the upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/predict", response_model=schemas.PredictionResponse)
def create_prediction(
    file: UploadFile = File(...),
    current_user: models.User = Depends(utils.get_current_user),
    db: Session = Depends(get_db)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "png"
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    with open(file_path, "rb") as f:
        image_bytes = f.read()
        
    try:
        predicted_digit, confidence, raw_scores = predict(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
        
    new_prediction = models.Prediction(
        user_id=current_user.id,
        predicted_digit=predicted_digit,
        confidence=confidence,
        image_path=file_path,
        raw_scores=raw_scores
    )
    db.add(new_prediction)
    db.commit()
    db.refresh(new_prediction)
    return new_prediction

@router.get("/history", response_model=List[schemas.PredictionResponse])
def get_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: models.User = Depends(utils.get_current_user),
    db: Session = Depends(get_db)
):
    predictions = db.query(models.Prediction)\
        .filter(models.Prediction.user_id == current_user.id)\
        .order_by(desc(models.Prediction.created_at))\
        .offset(skip).limit(limit).all()
    return predictions

@router.get("/admin/predictions", response_model=List[schemas.PredictionResponseAdmin])
def get_admin_predictions(
    user_id: Optional[int] = Query(None),
    current_user: models.User = Depends(utils.require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(
        models.Prediction.id,
        models.Prediction.user_id,
        models.Prediction.predicted_digit,
        models.Prediction.confidence,
        models.Prediction.image_path,
        models.Prediction.raw_scores,
        models.Prediction.created_at,
        models.User.name.label("user_name"),
        models.User.email.label("user_email")
    ).join(models.User, models.Prediction.user_id == models.User.id)
    
    if user_id is not None:
        query = query.filter(models.Prediction.user_id == user_id)
        
    results = query.order_by(desc(models.Prediction.created_at)).all()
    
    # Map raw Row objects to dictionaries to pass to Pydantic
    response = []
    for row in results:
        response.append({
            "id": row.id,
            "user_id": row.user_id,
            "predicted_digit": row.predicted_digit,
            "confidence": row.confidence,
            "image_path": row.image_path,
            "raw_scores": row.raw_scores,
            "created_at": row.created_at,
            "user_name": row.user_name,
            "user_email": row.user_email
        })
    return response

@router.get("/admin/users", response_model=List[schemas.UserResponse])
def get_admin_users(
    current_user: models.User = Depends(utils.require_admin),
    db: Session = Depends(get_db)
):
    users = db.query(models.User).order_by(desc(models.User.created_at)).all()
    return users

@router.get("/admin/stats")
def get_admin_stats(
    current_user: models.User = Depends(utils.require_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(models.User).count()
    total_predictions = db.query(models.Prediction).count()
    
    distribution = db.query(
        models.Prediction.predicted_digit,
        func.count(models.Prediction.id)
    ).group_by(models.Prediction.predicted_digit).all()
    
    digit_distribution = {str(digit): count for digit, count in distribution}
    
    return {
        "total_users": total_users,
        "total_predictions": total_predictions,
        "digit_distribution": digit_distribution
    }
