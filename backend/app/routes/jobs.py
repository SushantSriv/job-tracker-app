from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db, redis_client
from app.models import JobApplication, User, AvailableJob
from app.schemas import JobCreate, JobUpdate, Job, AvailableJobUpdate, JobApplicationOut, AvailableJobCreate, AvailableJobOut, StatusUpdate 
from app.routes.auth import get_current_user
from datetime import timedelta
from pydantic import BaseModel


router = APIRouter()

# ✅ Hent bare aktive jobbsøknader eller manuelle
@router.get("/jobs", response_model=list[Job])
def get_jobs(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return (
        db.query(JobApplication)
        .options(joinedload(JobApplication.available_job))
        .filter(
            JobApplication.user_id == user.id,
            (JobApplication.available_job_id == None) |  # manuelle jobber
            (JobApplication.available_job != None)        # koblede jobber som fortsatt finnes
        )
        .all()
    )

@router.post("/jobs", response_model=Job)
def create_job(job: JobCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    job_obj = JobApplication(**job.dict(), user_id=user.id)
    db.add(job_obj)
    db.commit()
    db.refresh(job_obj)

    if job_obj.status == "avslått":
        redis_client.setex(f"rejected_job:{job_obj.id}", timedelta(days=30), "marked")

    return job_obj

@router.put("/jobs/{job_id}", response_model=Job)
def update_job(job_id: int, payload: JobUpdate | StatusUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # For admin: tillat oppdatering av status
    job = db.query(JobApplication).filter(JobApplication.id == job_id).first() \
        if user.is_admin else \
        db.query(JobApplication).filter_by(id=job_id, user_id=user.id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Søknad ikke funnet")

    # Oppdater tillatte felt
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(job, key, value)

    db.commit()
    db.refresh(job)

    if job.status == "avslått":
        redis_client.setex(f"rejected_job:{job.id}", timedelta(days=30), "marked")

    return job

@router.delete("/jobs/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    job_obj = db.query(JobApplication).filter_by(id=job_id, user_id=user.id).first()
    if not job_obj:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job_obj)
    db.commit()
    return {"message": "Job deleted"}

@router.post("/apply/{job_id}", response_model=JobApplicationOut)
def apply_to_job(job_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    job = db.query(AvailableJob).filter_by(id=job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    application = JobApplication(
        company=job.company,
        job_title=job.title,
        status="søkt",
        available_job_id=job.id,
        user_id=user.id
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application
