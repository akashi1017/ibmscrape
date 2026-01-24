# Backend Setup Guide

This guide will help you set up the FastAPI backend with PostgreSQL for the Digit Classification application.

## Prerequisites

1. **Python 3.8+** installed
2. **PostgreSQL** installed and running
3. **pip** (Python package manager)

## Step 1: Install PostgreSQL

### Windows:
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install PostgreSQL (remember the password you set for the `postgres` user)
3. PostgreSQL will run on `localhost:5432` by default

### Create Database:
```sql
CREATE DATABASE digit_classification_db;
```

Or using psql command line:
```bash
psql -U postgres
CREATE DATABASE digit_classification_db;
\q
```

## Step 2: Install Python Dependencies

1. Navigate to the project root directory
2. Install required packages:
```bash
pip install -r requirements.txt
```

Or using a virtual environment (recommended):
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
copy backend\.env.example backend\.env
```

2. Edit `backend/.env` and update:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/digit_classification_db
SECRET_KEY=your-super-secret-key-change-this-in-production
```

Replace:
- `YOUR_PASSWORD` with your PostgreSQL password
- `your-super-secret-key-change-this-in-production` with a secure random string

## Step 4: Create Database Tables

Run the database setup script:
```bash
python backend/database_setup.py
```

Or tables will be created automatically when you first run the server.

## Step 5: Run the Backend Server

Start the FastAPI server:
```bash
python backend/run.py
```

Or using uvicorn directly:
```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## API Endpoints

### Authentication

- **POST** `/api/auth/register` - Register a new user
  - Body: `{ "name": "string", "email": "string", "password": "string" }`
  - Returns: User object

- **POST** `/api/auth/login-json` - Login with JSON (for React frontend)
  - Body: `{ "email": "string", "password": "string" }`
  - Returns: `{ "access_token": "string", "token_type": "bearer" }`

- **POST** `/api/auth/login` - Login with OAuth2 form (for API docs)
  - Form data: `username` (email) and `password`

- **GET** `/api/auth/me` - Get current user (requires authentication)
  - Headers: `Authorization: Bearer <token>`

## Testing the API

1. Visit http://localhost:8000/docs to use the interactive API documentation
2. Try registering a user at `/api/auth/register`
3. Try logging in at `/api/auth/login-json`

## Troubleshooting

### Connection Error to Database
- Make sure PostgreSQL is running
- Check your DATABASE_URL in `.env` file
- Verify the database `digit_classification_db` exists

### Import Errors
- Make sure you're in the project root directory
- Ensure all dependencies are installed: `pip install -r requirements.txt`

### Port Already in Use
- Change the port in `backend/run.py` or use: `uvicorn backend.main:app --port 8001`

## Database Schema

### Users Table
- `id` (Integer, Primary Key)
- `name` (String)
- `email` (String, Unique)
- `hashed_password` (String)
- `created_at` (DateTime)
- `updated_at` (DateTime)

## Security Notes

1. **Change the SECRET_KEY** in production - use a strong random string
2. **Use environment variables** for sensitive data, never commit `.env` to version control
3. **Use HTTPS** in production
4. **Implement rate limiting** for authentication endpoints in production
5. **Use strong passwords** - consider adding password strength validation
