# Backend Setup Guide

This guide covers the FastAPI backend setup for the Digit Classification application.

## Current Setup: SQLite (Recommended for Development)

The backend is configured to use **SQLite** by default - no database server installation needed!

The database file (`database.db`) is automatically created in the project root when the server starts.

## Prerequisites

1. **Python 3.8+** installed
2. **pip** (Python package manager)

**Note:** PostgreSQL is optional. Skip to "Step 2: Install Python Dependencies" if using SQLite.

## Step 1: Install Python Dependencies

Navigate to the project root directory and install required packages:

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

## Step 2: Configure Environment Variables

The `.env` file is pre-configured for SQLite development. 

**For SQLite (default):**
No additional configuration needed! The database will be created automatically.

**For PostgreSQL (optional):**
1. Install PostgreSQL: https://www.postgresql.org/download/windows/
2. Create the database:
```sql
psql -U postgres
CREATE DATABASE digit_classification_db;
\q
```
3. Edit `backend/.env` and update:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/digit_classification_db
SECRET_KEY=your-super-secret-key-change-this-in-production
```

Start the FastAPI server:

```bash
python backend/run.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive API Docs**: http://localhost:8000/docs (try registering/logging in here!)
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

## Database Information

### SQLite (Development - Default)
- File: `database.db` in project root
- Auto-created on first server start
- Delete and restart server to reset database
- Perfect for local development

### PostgreSQL (Production - Optional)
- Requires separate server installation
- Multi-user capable
- Better for production deployments
- Follow PostgreSQL setup steps above to switch

### Database Schema
**Users Table:**
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
6. **SQLite for dev only** - Use PostgreSQL for production deployments
