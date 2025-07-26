from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.models import AvailableJob, User
from app.schemas import AvailableJobCreate, AvailableJobOut, AvailableJobUpdate
from app.database import get_db
from app.routes.auth import get_current_user
from app.models import AvailableJob, JobApplication

router = APIRouter()

@router.get("/available-jobs", response_model=list[AvailableJobOut])
def get_available_jobs(db: Session = Depends(get_db)):
    return db.query(AvailableJob).all()

@router.post("/available-jobs", response_model=AvailableJobOut)
def create_available_job(job: AvailableJobCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    new_job = AvailableJob(**job.dict())
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

@router.put("/available-jobs/{job_id}", response_model=AvailableJobOut)
def update_available_job(
    job_id: int,
    job_data: AvailableJobUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Kun admin kan oppdatere")

    job = db.query(AvailableJob).filter(AvailableJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Jobb ikke funnet")

    job.title = job_data.title
    job.description = job_data.description
    db.commit()
    db.refresh(job)
    return job

@router.delete("/available-jobs/{job_id}")
def delete_available_job(job_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    
    job = db.query(AvailableJob).filter_by(id=job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 🔥 Slett tilknyttede søknader først
    db.query(JobApplication).filter_by(available_job_id=job_id).delete()

    # 🗑 Slett selve jobben
    db.delete(job)
    db.commit()

    return {"message": "Job and all applications deleted"}

