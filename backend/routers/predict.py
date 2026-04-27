import os
import uuid
import shutil
from typing import List, Optional
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from backend import schemas, models, utils
from backend.database import get_db
from backend.model import predict_multi

router = APIRouter()
UPLOAD_DIR = "uploads"
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _serialize_prediction(p: models.Prediction) -> dict:
    per_digit = None
    if p.per_digit_confidences:
        per_digit = [
            schemas.DigitResult(digit=entry["digit"], confidence=float(entry["confidence"]))
            for entry in p.per_digit_confidences
        ]
    return {
        "id": p.id,
        "user_id": p.user_id,
        "predicted_value": p.predicted_value,
        "confidence": float(p.confidence),
        "digit_count": p.digit_count,
        "per_digit_confidences": per_digit,
        "image_path": p.image_path,
        "prediction_source": getattr(p, "prediction_source", "resnet"),
        "created_at": p.created_at,
    }


@router.post("/predict", response_model=schemas.PredictionCreateResponse)
def create_prediction(
    file: UploadFile = File(...),
    source: str = Form("upload"),
    current_user: models.User = Depends(utils.get_current_user),
    db: Session = Depends(get_db),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = file.file.read()
    if len(image_bytes) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_UPLOAD_SIZE // (1024 * 1024)} MB",
        )

    _, ext = os.path.splitext(file.filename) if file.filename else ("", "")
    file_extension = ext.lstrip(".") or "png"
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        buffer.write(image_bytes)

    # Canvas drawings → ResNet only (clean, fast). Uploads → Groq vision LLM first.
    prefer_vision = source == "upload"

    try:
        number_str, avg_confidence, digit_results, prediction_source = predict_multi(
            image_bytes, prefer_vision=prefer_vision
        )
    except HTTPException:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    new_prediction = models.Prediction(
        user_id=current_user.id,
        predicted_value=number_str,
        confidence=avg_confidence,
        digit_count=len(digit_results),
        per_digit_confidences=digit_results,
        image_path=file_path,
        prediction_source=prediction_source,
    )
    db.add(new_prediction)
    db.commit()
    db.refresh(new_prediction)

    return schemas.PredictionCreateResponse(
        id=new_prediction.id,
        predicted_value=new_prediction.predicted_value,
        confidence=float(new_prediction.confidence),
        digit_count=new_prediction.digit_count,
        per_digit_confidences=[
            schemas.DigitResult(digit=d["digit"], confidence=float(d["confidence"]))
            for d in digit_results
        ],
        image_path=new_prediction.image_path,
        prediction_source=new_prediction.prediction_source,
        created_at=new_prediction.created_at,
    )


@router.get("/history", response_model=List[schemas.PredictionResponse])
def get_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: models.User = Depends(utils.get_current_user),
    db: Session = Depends(get_db),
):
    predictions = (
        db.query(models.Prediction)
        .filter(models.Prediction.user_id == current_user.id)
        .order_by(desc(models.Prediction.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [_serialize_prediction(p) for p in predictions]


@router.get("/history/count")
def get_history_count(
    current_user: models.User = Depends(utils.get_current_user),
    db: Session = Depends(get_db),
):
    total = (
        db.query(func.count(models.Prediction.id))
        .filter(models.Prediction.user_id == current_user.id)
        .scalar()
    )
    return {"total": int(total or 0)}


@router.get("/me/stats", response_model=schemas.UserStats)
def get_user_stats(
    current_user: models.User = Depends(utils.get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(models.Prediction).filter(models.Prediction.user_id == current_user.id)
    count = q.count()
    avg_conf = (
        db.query(func.avg(models.Prediction.confidence))
        .filter(models.Prediction.user_id == current_user.id)
        .scalar()
    )
    last = q.order_by(desc(models.Prediction.created_at)).first()
    return schemas.UserStats(
        prediction_count=count,
        avg_confidence=float(avg_conf) if avg_conf is not None else 0.0,
        last_prediction=_serialize_prediction(last) if last else None,
    )


# ---------- Admin ----------

@router.get("/admin/predictions", response_model=List[schemas.PredictionResponseAdmin])
def get_admin_predictions(
    user_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    current_user: models.User = Depends(utils.require_admin),
    db: Session = Depends(get_db),
):
    query = (
        db.query(models.Prediction, models.User.name.label("user_name"), models.User.email.label("user_email"))
        .join(models.User, models.Prediction.user_id == models.User.id)
    )
    if user_id is not None:
        query = query.filter(models.Prediction.user_id == user_id)

    rows = query.order_by(desc(models.Prediction.created_at)).offset(skip).limit(limit).all()
    response = []
    for prediction, user_name, user_email in rows:
        item = _serialize_prediction(prediction)
        item["user_name"] = user_name
        item["user_email"] = user_email
        response.append(item)
    return response


@router.get("/admin/users", response_model=List[schemas.UserResponse])
def get_admin_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    current_user: models.User = Depends(utils.require_admin),
    db: Session = Depends(get_db),
):
    return db.query(models.User).order_by(desc(models.User.created_at)).offset(skip).limit(limit).all()


@router.get("/admin/stats")
def get_admin_stats(
    current_user: models.User = Depends(utils.require_admin),
    db: Session = Depends(get_db),
):
    """Top-level counters for the admin overview cards."""
    total_users = db.query(models.User).count()
    total_predictions = db.query(models.Prediction).count()
    return {
        "total_users": total_users,
        "total_predictions": total_predictions,
    }


@router.get("/admin/analytics")
def get_admin_analytics(
    days: int = Query(30, ge=1, le=365),
    current_user: models.User = Depends(utils.require_admin),
    db: Session = Depends(get_db),
):
    """Aggregated analytics for admin charts.

    Returns:
      - confidence_buckets:        [{range: "0-10", count: N}, ...] (10 buckets)
      - scatter:                   [{predicted_value, confidence}, ...]
      - predictions_over_time:     [{date: "YYYY-MM-DD", count: N}, ...]
      - digit_frequency:           {"0": N, "1": N, ...}  (counts each digit 0-9 across all predictions)
      - avg_confidence_per_digit:  {"0": float, "1": float, ...}
    """
    # Pull all predictions (we do per-digit aggregation in Python — JSON aggregation
    # is awkward across SQLite/Postgres and the dataset for this app is small).
    rows = (
        db.query(
            models.Prediction.id,
            models.Prediction.predicted_value,
            models.Prediction.confidence,
            models.Prediction.per_digit_confidences,
            models.Prediction.created_at,
        )
        .order_by(desc(models.Prediction.created_at))
        .all()
    )

    # ----- Confidence histogram (10 buckets, 0-100%) -----
    buckets = [0] * 10
    for r in rows:
        c = float(r.confidence) * 100.0
        idx = min(int(c // 10), 9)
        buckets[idx] += 1
    confidence_buckets = [
        {"range": f"{i*10}-{(i+1)*10}", "count": buckets[i]} for i in range(10)
    ]

    # ----- Scatter (predicted_value vs confidence) -----
    scatter = [
        {"predicted_value": r.predicted_value, "confidence": float(r.confidence)}
        for r in rows[:1000]  # cap for payload size
    ]

    # ----- Predictions over time (last `days` days, grouped by date) -----
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    by_date: dict[str, int] = {}
    for r in rows:
        if r.created_at and r.created_at >= cutoff:
            day = r.created_at.date().isoformat()
            by_date[day] = by_date.get(day, 0) + 1
    predictions_over_time = [
        {"date": day, "count": by_date[day]} for day in sorted(by_date.keys())
    ]

    # ----- Per-digit frequency + avg confidence (across all multi-digit results) -----
    digit_freq = {str(i): 0 for i in range(10)}
    digit_conf_sum = {str(i): 0.0 for i in range(10)}
    for r in rows:
        per = r.per_digit_confidences
        if not per:
            # Fall back to predicted_value if per-digit data missing (legacy rows).
            if r.predicted_value:
                for ch in r.predicted_value:
                    if ch.isdigit():
                        digit_freq[ch] += 1
                        digit_conf_sum[ch] += float(r.confidence)
            continue
        for entry in per:
            d = str(entry.get("digit"))
            if d in digit_freq:
                digit_freq[d] += 1
                digit_conf_sum[d] += float(entry.get("confidence", 0.0))

    avg_confidence_per_digit = {
        d: (digit_conf_sum[d] / digit_freq[d]) if digit_freq[d] > 0 else 0.0
        for d in digit_freq
    }

    return {
        "confidence_buckets": confidence_buckets,
        "scatter": scatter,
        "predictions_over_time": predictions_over_time,
        "digit_frequency": digit_freq,
        "avg_confidence_per_digit": avg_confidence_per_digit,
    }
