from fastapi import FastAPI, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import SessionLocal, redis_client, Base, engine
from app import models
from app.auth import verify_google_token, create_jwt_token,get_current_user
from dotenv import load_dotenv

# 📦 Last inn .env-variabler
load_dotenv()

app = FastAPI()

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

# 🔐 Login-rute – bruk denne fra frontend etter Google-login
@app.post("/login")
def login(id_token: str = Body(...), db: Session = Depends(get_db)):
    # 1. Verifiser token mot Google
    user_info = verify_google_token(id_token)

    # 2. Finn eller opprett bruker i databasen
    user = db.query(models.User).filter(models.User.google_id == user_info["google_id"]).first()
    if not user:
        user = models.User(
            google_id=user_info["google_id"],
            email=user_info["email"],
            full_name=user_info.get("full_name")
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # 3. Lag JWT-token (inneholder bare bruker-id)
    token = create_jwt_token({"user_id": user.id})

    return {"access_token": token}

@app.get("/me")
def read_current_user(user: models.User = Depends(get_current_user)):
    return {"id": user.id, "email": user.email, "name": user.full_name}