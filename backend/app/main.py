from fastapi import FastAPI, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import SessionLocal, redis_client, Base, engine
from app import models
from app.routes.auth import verify_google_token, create_jwt_token, get_current_user
from dotenv import load_dotenv
from app.routes import auth as auth_routes
from app.routes import jobs , available_jobs
from app.background_tasks import purge_rejected_jobs
from fastapi.middleware.cors import CORSMiddleware
from app.routes import admin





# 📦 Last inn .env-variabler
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_routes.router)
app.include_router(jobs.router)
app.include_router(available_jobs.router)
app.include_router(admin.router)


# ⚙️ Opprett DB-tabeller (kun én gang)
Base.metadata.create_all(bind=engine)

# 🧠 DB-session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ Helse-sjekk
@app.get("/")
def root():
    return {"message": "Job Tracker Backend is running"}

@app.get("/ping")
def ping(db: Session = Depends(get_db)):
    redis_client.set("status", "connected", ex=10)
    return {
        "postgres": "ok",
        "redis": redis_client.get("status")
    }

@app.get("/me")
def read_current_user(user: models.User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "name": user.full_name,
        "is_admin": user.is_admin
    }


@app.on_event("startup")
def cleanup_on_start():
    purge_rejected_jobs()