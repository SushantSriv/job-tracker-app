import os
import requests
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models

# Last .env-verdier
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "your-client-id.apps.googleusercontent.com")
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretjwt")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_MINUTES = 60 * 24 * 7  # 1 uke

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")  # ikke brukt direkte, men nødvendig for Depends

def verify_google_token(id_token: str):
    try:
        print("🌍 Sending token to Google...")
        api_key = os.getenv("GOOGLE_FIREBASE_API_KEY")
        response = requests.get(f"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={api_key}",  # 👈 dette er egentlig API_KEY
        json={"idToken": id_token})

        print("🔄 Google response code:", response.status_code)
        print("📦 Raw response body:", response.text)
    except requests.exceptions.RequestException as e:
        print("❌ Request to Google failed:", e)
        raise HTTPException(status_code=500, detail="Could not contact Google for token verification")

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google ID token")

    try:
        payload = response.json()
    except Exception as e:
        print("❌ JSON decode error:", e)
        raise HTTPException(status_code=500, detail="Failed to parse response from Google")

    audience = payload.get("aud")
    print("🔐 Token audience from Google:", audience)
    print("🎯 Expected GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID)

    if audience != GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Invalid Google Client ID")

    return {
        "google_id": payload.get("sub"),
        "email": payload.get("email"),
        "full_name": payload.get("name")
    }



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
