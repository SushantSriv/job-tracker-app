from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import models
from app.database import get_db
from datetime import datetime
from app.routes.auth import get_current_user
from app.models import User



router = APIRouter()

@router.get("/admin/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    return {
        "user_count": db.query(models.User).count(),
        "job_count": db.query(models.JobApplication).count(),
        "available_job_count": db.query(models.AvailableJob).count(),
        "last_updated": datetime.utcnow().isoformat()
    }

@router.get("/admin/applications")
def get_all_applications(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Kun admin har tilgang")

    applications = (
        db.query(models.JobApplication, models.User.email)
        .join(models.User, models.JobApplication.user_id == models.User.id)
        .all()
    )

    return [
        {
            "id": app.JobApplication.id,
            "company": app.JobApplication.company,
            "job_title": app.JobApplication.job_title,
            "status": app.JobApplication.status,
            "user_email": app.email
        }
        for app in applications
    ]