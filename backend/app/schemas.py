from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class JobBase(BaseModel):
    company: str
    job_title: str
    status: str
    link: Optional[str] = None
    notes: Optional[str] = None
    company_link: Optional[str] = None
    logo_url: Optional[str] = None


class JobCreate(JobBase):
    pass

class JobUpdate(JobBase):
    pass

class Job(BaseModel):
    id: int
    company: str
    job_title: str
    status: str
    link: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    company_link: Optional[str] = None
    logo_url: Optional[str] = None


    class Config:
        orm_mode = True

class AvailableJobBase(BaseModel):
    company: str
    title: str
    description: Optional[str] = None
    company_link: Optional[str] = None
    logo_url: Optional[str] = None


class AvailableJobCreate(AvailableJobBase):
    pass

class AvailableJobOut(AvailableJobBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class AvailableJobUpdate(BaseModel):
    company: str | None = None
    title: str | None = None
    description: str | None = None
    company_link: Optional[str] = None
    logo_url: Optional[str] = None


class JobApplicationOut(BaseModel):
    id: int
    company: str
    job_title: str
    status: str
    link: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    available_job_id: Optional[int] = None  # 👈 viktig for kobling til AvailableJob
    company_link: Optional[str] = None
    logo_url: Optional[str] = None


    class Config:
        orm_mode = True

class StatusUpdate(BaseModel):
    status: str
