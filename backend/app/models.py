from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)
    job_applications = relationship("JobApplication", back_populates="user", cascade="all, delete")


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String, nullable=False)
    job_title = Column(String, nullable=False)
    status = Column(String, nullable=False)
    link = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    company_link = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="job_applications")

    available_job_id = Column(Integer, ForeignKey("available_jobs.id", ondelete="CASCADE"), nullable=True)
    available_job = relationship("AvailableJob", back_populates="applications")


class AvailableJob(Base):
    __tablename__ = "available_jobs"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    company_link = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    applications = relationship("JobApplication", back_populates="available_job", cascade="all, delete")

