# PostgreSQL Setup Instructions

## Option 1: Manual Installation (Recommended)

1. **Download PostgreSQL:**
   - Visit: https://www.postgresql.org/download/windows/
   - Click "Download the installer"
   - Download PostgreSQL 16 (or latest version)

2. **Run the Installer:**
   - Run the downloaded `.exe` file
   - During installation:
     - **Port:** Keep default (5432)
     - **Password:** Set a password for the `postgres` superuser (REMEMBER THIS!)
     - Complete the installation

3. **Start PostgreSQL Service:**
   - PostgreSQL service should start automatically after installation
   - If not, open Services (Win+R, type `services.msc`)
   - Find "postgresql-x64-16" or similar
   - Start the service if it's not running

4. **Verify Installation:**
   - Open Command Prompt or PowerShell
   - Run: `psql --version`

## Option 2: Using SQLite (Easier for Development)

If PostgreSQL installation is complex, we can switch to SQLite for development which doesn't require installation.

## After Installation

Once PostgreSQL is installed, update `backend/.env` with your password:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/digit_classification_db
```

Then create the database by running:
```
psql -U postgres
CREATE DATABASE digit_classification_db;
\q
```
