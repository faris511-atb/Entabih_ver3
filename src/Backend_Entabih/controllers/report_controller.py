
from sqlalchemy.orm import Session
from models.reports import Report  # ✅ SQLAlchemy model
from schemas.reports import ReportCreate  # ✅ Pydantic schema

def create_report(report: ReportCreate, db: Session):
    new_report = Report(**report.dict())
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

def get_reports(db: Session):
    return db.query(Report).all()
