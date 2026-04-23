
from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional

class ReportBase(BaseModel):
    title: str
    description: str
    # report_name: str
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    message_type: Optional[str] = None

class ReportCreate(ReportBase):
    user_id: int

class ReportResponse(ReportBase):
    report_id: int
    user_id: int
    reported_at: datetime

    class Config:
        from_attributes = True  
