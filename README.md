# MNIST Digit Classification Web Application

## 1. Project Overview
A full-stack web app where users can upload images of handwritten digits and get predictions from an MNIST-trained CNN model. Includes user auth (register/login), prediction history, and an admin dashboard with stats.

Stack: React + Vite (frontend), FastAPI (backend), PostgreSQL (database), Docker + Docker Compose (orchestration), TensorFlow/Keras (ML model).

---

## 2. Prerequisites
- **Docker Desktop** (includes Docker Compose) — for the recommended Docker workflow
- **Node.js v18+ and npm** — only needed if running the frontend locally
- **Python 3.11+** — only needed if running the backend locally without Docker

---

## 3. Quick Start — Recommended (Docker)
1. Clone the repo and `cd` into it.
2. Copy `.env` if needed (note that `docker-compose` already sets env vars, so this is optional).
3. Place the ML model file:
   Copy `best_mnist_cnn.keras` into the `backend/` folder.
   *(If not available, the backend will use a random stub for predictions — everything else still works.)*
4. Start everything with one command:
   ```bash
   docker-compose up --build
   ```
5. Access the app:
   - **Frontend:** http://localhost:3000
   - **Backend API:** http://localhost:8000
   - **API Docs (Swagger):** http://localhost:8000/docs

To stop:
```bash
docker-compose down
```

To stop AND delete the database volume (full reset):
```bash
docker-compose down -v
```

---

## 4. Running the Frontend Locally (without Docker)
For frontend-only development when the backend is already running.

1. `npm install`
2. `npm run dev`
3. Open http://localhost:3000

*Note: The frontend expects the backend at http://localhost:8000. Make sure the backend (Docker or local) is running first.*

---

## 5. Running the Backend Locally (without Docker)
For backend development without Docker. Requires a local PostgreSQL instance.

1. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up `backend/.env`:
   ```env
   DATABASE_URL=postgresql://digituser:digitpass@localhost:5432/digitdb
   SECRET_KEY=your-secret-key-here
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   ```

4. Make sure PostgreSQL is running locally and the database exists.

5. Start the backend:
   ```bash
   python backend/run.py
   # OR:
   uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```

6. API available at http://localhost:8000
   Swagger docs at http://localhost:8000/docs

---

## 6. Docker Commands Cheatsheet

| Command | Description |
|---|---|
| `docker-compose up --build` | Start all services (build if needed) |
| `docker-compose up -d --build` | Start in background (detached) |
| `docker-compose logs -f` | View live logs |
| `docker-compose logs -f backend` | View logs for backend only |
| `docker-compose down` | Stop all services (keep data) |
| `docker-compose down -v` | Stop and delete all data (fresh DB) |
| `docker-compose build backend` | Rebuild backend image only |
| `docker-compose exec backend bash` | Open a shell inside the running backend container |
| `docker-compose exec db psql -U digituser -d digitdb` | Connect to the PostgreSQL database directly |

---

## 7. API Endpoints Reference

### Auth endpoints (prefix: `/api/auth`)
| Method | Path | Auth Required | Description |
|---|---|---|---|
| `POST` | `/register` | No | Register a new user |
| `POST` | `/login-json` | No | Login with JSON body, returns JWT token |
| `POST` | `/login` | No | Login via OAuth2 form (for Swagger UI) |
| `GET` | `/me` | Bearer token | Get current user profile |

### Prediction endpoints (prefix: `/api`)
| Method | Path | Auth Required | Description |
|---|---|---|---|
| `POST` | `/predict` | Bearer token | Upload image, get digit prediction |
| `GET` | `/history` | Bearer token | Get current user's prediction history |

### Admin endpoints (prefix: `/api`)
| Method | Path | Auth Required | Description |
|---|---|---|---|
| `GET` | `/admin/predictions` | Admin | All predictions (filter by user_id optional) |
| `GET` | `/admin/users` | Admin | All users |
| `GET` | `/admin/stats` | Admin | Total users, predictions, digit distribution |

### Utility
| Method | Path | Description |
|---|---|---|
| `GET` | `/` | returns `{"message": "API is running"}` |
| `GET` | `/api/health` | returns `{"status": "healthy"}` |

---

## 8. Project Structure

```text
.
├── backend/
│   ├── __init__.py
│   ├── main.py               # FastAPI app entry point
│   ├── database.py           # SQLAlchemy engine & session
│   ├── models.py             # ORM models (User, Prediction)
│   ├── schemas.py            # Pydantic schemas
│   ├── utils.py              # JWT, password hashing, auth dependencies
│   ├── model.py              # MNIST model loading & inference
│   ├── best_mnist_cnn.keras  # (place your model file here)
│   ├── run.py                # Local dev server runner
│   └── routers/
│       ├── __init__.py
│       ├── auth.py           # Auth routes
│       └── predict.py        # Predict, history, admin routes
├── src/                      # React frontend source
├── uploads/                  # Saved prediction images (auto-created)
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── package.json
└── README.md
```

---

## 9. Environment Variables

| Variable | Location | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | `backend/.env` or `docker-compose.yml` | (see docker-compose) | PostgreSQL connection string |
| `SECRET_KEY` | `backend/.env` or `docker-compose.yml` | changeme | JWT signing secret — change in production |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `backend/.env` or `docker-compose.yml` | `60` | JWT token lifetime in minutes |

---

## 10. Troubleshooting

- **"Port 3000 already in use":** kill the process or change port in `vite.config.ts`
- **"Port 8000 already in use":** change the port mapping in `docker-compose.yml`
- **"Connection refused" on frontend login:** make sure backend container is running (`docker-compose up`), check `docker-compose logs -f backend`
- **Database errors on startup:** run `docker-compose down -v` then `docker-compose up --build` to start with a fresh database
- **Model file missing warning:** place `best_mnist_cnn.keras` in the `backend/` folder; without it the app still runs but returns random predictions
- **To create an admin user:** connect to psql (`docker-compose exec db psql -U digituser -d digitdb`) and run:
  ```sql
  UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
  ```
