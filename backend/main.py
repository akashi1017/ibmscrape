import os
import traceback
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.database import engine, Base
from backend.routers import auth, predict

app = FastAPI(title="Digit Classification API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(predict.router, prefix="/api", tags=["Predictions"])

@app.get("/")
def read_root():
    return {"message": "API is running"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal Server Error",
            "error_message": str(exc),
            "traceback": traceback.format_exc()
        }
    )
