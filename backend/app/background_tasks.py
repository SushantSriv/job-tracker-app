from sqlalchemy.orm import Session
from app.database import redis_client, SessionLocal
from app.models import JobApplication

def purge_rejected_jobs():
    db: Session = SessionLocal()

    # Finn alle jobber som har utløpt i Redis
    keys = redis_client.keys("rejected_job:*")
    redis_ids = [int(key.split(":")[1]) for key in keys]

    if not redis_ids:
        db.close()
        return

    for job_id in redis_ids:
        job = db.query(JobApplication).filter_by(id=job_id, status="avslått").first()
        if job:
            db.delete(job)
            db.commit()
            redis_client.delete(f"rejected_job:{job_id}")

    db.close()
