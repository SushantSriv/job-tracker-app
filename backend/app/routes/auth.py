import os
import requests
from fastapi import HTTPException, status, Depends ,APIRouter
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models, database
from pydantic import BaseModel


# Last .env-verdier
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "your-client-id.apps.googleusercontent.com")
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretjwt")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_MINUTES = 60 * 24 * 7  # 1 uke

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")  # ikke brukt direkte, men nødvendig for Depends

def verify_google_token(id_token: str):
    try:
        # Hent Google sine offentlige nøkler
        res = requests.get("https://www.googleapis.com/oauth2/v3/certs",verify=False)
        jwks = res.json()
        unverified_header = jwt.get_unverified_header(id_token)

        # Finn riktig nøkkel basert på 'kid'
        key = next((k for k in jwks['keys'] if k['kid'] == unverified_header['kid']), None)
        if not key:
            raise HTTPException(status_code=401, detail="Public key not found")

        # Verifiser JWT
        payload = jwt.decode(
            id_token,
            key,
            algorithms=['RS256'],
            audience=GOOGLE_CLIENT_ID  # må samsvare med frontend
        )

        return {
            "google_id": payload["sub"],
            "email": payload["email"],
            "full_name": payload.get("name", ""),
            "picture": payload.get("picture")
        }

    except Exception as e:
        print(f"⚠️ Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid ID token")



# 🔐 Lag JWT-token etter login
def create_jwt_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRY_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

# 🔐 Verifiser JWT-token og hent bruker
def get_current_user(token: str = Depends(oauth2_scheme)) -> models.User:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Hent bruker fra databasen
        db: Session = SessionLocal()
        user = db.query(models.User).filter(models.User.id == user_id).first()
        db.close()

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


router = APIRouter()


class TokenInput(BaseModel):
    id_token: str

@router.post("/login")
async def login(payload: TokenInput):
    id_token = payload.id_token

    # 🔒 1. Verifiser Google-token
    user_info = verify_google_token(id_token)
    email = user_info["email"]
    full_name = user_info.get("full_name")
    google_id = user_info["google_id"]

    # 🧠 2. Finn eller opprett bruker
    db: Session = database.SessionLocal()
    user = db.query(models.User).filter(
    (models.User.google_id == google_id) | (models.User.email == email)).first()

    if not user:
        is_admin = email == "sushant.nmbu@gmail.com"
        user = models.User(
            google_id=google_id,
            email=email,
            full_name=full_name,
            is_admin=is_admin  # ← her!
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    else:
        # Oppdater google_id hvis den mangler eller har endret seg
        if user.google_id != google_id:
            user.google_id = google_id
            db.commit()

    # 🔐 3. Generer JWT-token
    token = create_jwt_token({"user_id": user.id})
    print("✅ JWT:", token)

    db.close()

    # 📦 4. Returner token til frontend
    return {"access_token": token, "token_type": "bearer"}

