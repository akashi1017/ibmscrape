# Quick Start Guide

## ✅ Completed Steps

1. ✅ Python dependencies installed
2. ✅ Backend code structure created
3. ✅ Frontend connected to backend API
4. ✅ SQLite database configured (no server needed!)

## 🚀 To Start the Application

### 1. Database Setup (Automatic)

SQLite database is automatically created when the backend server starts. No manual setup needed!

The database file `database.db` will be created in the project root directory.

**Note:** If you want to use PostgreSQL instead of SQLite:
- Update `DATABASE_URL` in `backend/.env` to: `postgresql://postgres:YOUR_PASSWORD@localhost:5432/digit_classification_db`
- PostgreSQL setup guide available in `BACKEND_README.md`

### 2. Start the Backend Server

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

**Server won't start:**
- Make sure you're in the project root directory: `cd e:\IBM_project`
- Verify all dependencies: `python -m pip install -r requirements.txt`
- Check for Python errors in the terminal output

**Port Already in Use:**
- Change port in `backend/run.py` or use: `uvicorn backend.main:app --port 8001`

**Database Issues (SQLite):**
- Delete `database.db` file and restart the server to recreate it
- The database file is created automatically in the project root

**Want to use PostgreSQL instead:**
- Follow the guide in `BACKEND_README.md`
- Update `DATABASE_URL` in `backend/.env`
