from models import reports as report_model
from schemas import reports as report_schema
from sqlalchemy.orm import Session
from fastapi import HTTPException

def get_reports(db: Session):
    reports = db.query(report_model.Report).order_by(report_model.Report.reported_at.desc()).all()
    return [report_schema.ReportResponse.from_orm(r) for r in reports]