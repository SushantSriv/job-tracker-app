# reset_db.py
from app.database import engine, Base

# ❌ Sletter alle tabeller
Base.metadata.drop_all(bind=engine)

# ✅ Lager tabellene igjen med oppdaterte kolonner
Base.metadata.create_all(bind=engine)

print("✅ Database ble nullstilt og gjenopprettet.")
