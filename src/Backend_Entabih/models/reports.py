

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from database import Base

class Report(Base):
    __tablename__ = "reports"

    report_id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    phone_number = Column(String, nullable=True)
    email = Column(String, nullable=True)
    message_type = Column(String, nullable=True)
    reported_at = Column(DateTime(timezone=True), server_default=func.now())  
    user_id = Column(Integer, ForeignKey("users.user_id"))

    user = relationship("User", back_populates="reports")
    