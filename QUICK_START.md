# Quick Start Guide

## ✅ Completed Steps

1. ✅ Python dependencies installed
2. ✅ Backend code structure created
3. ✅ Frontend connected to backend API

## 🚀 To Start the Application

### 1. Set Up PostgreSQL Database

**Option A: Using PostgreSQL Command Line**
```sql
psql -U postgres
CREATE DATABASE digit_classification_db;
\q
```

**Option B: Using pgAdmin or any PostgreSQL GUI**
- Create a new database named: `digit_classification_db`

### 2. Update Database Credentials

Edit `backend/.env` and update:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/digit_classification_db
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

### 3. Start the Backend Server

```bash
python backend/run.py
```

The backend will run on **http://localhost:8000**
- API Docs: http://localhost:8000/docs

### 4. Start the Frontend (if not already running)

In a new terminal:
```bash
npm start
```

The frontend will run on **http://localhost:3000**

## 🧪 Test the Setup

1. Open http://localhost:3000 in your browser
2. Click "Sign up" to create a new account
3. Use the login page to sign in with your credentials

## 📝 API Endpoints

- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login-json` - Login (for React frontend)
- **GET** `/api/auth/me` - Get current user (requires auth token)

## ⚠️ Troubleshooting

**Database Connection Error:**
- Make sure PostgreSQL is running
- Verify database `digit_classification_db` exists
- Check `DATABASE_URL` in `backend/.env`

**Port Already in Use:**
- Change port in `backend/run.py` or use: `uvicorn backend.main:app --port 8001`

**Import Errors:**
- Make sure you're in the project root directory
- Verify all dependencies: `python -m pip install -r requirements.txt`
