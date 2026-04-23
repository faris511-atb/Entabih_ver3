from sqlalchemy import Column, Integer, String
from database import Base

class Feedback(Base):
    __tablename__ = "feedbacks"
    feedback_id = Column(Integer, primary_key=True, index=True)
    rating = Column(Integer)
    selected_tag = Column(String)
    feedback_text = Column(String)