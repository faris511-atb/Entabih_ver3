from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.feedbacks import Feedback
from schemas.feedbacks import FeedbackCreate, FeedbackResponse

router = APIRouter(prefix="/feedbacks", tags=["feedbacks"])

@router.post("/", response_model=FeedbackResponse)
def create_feedback(feedback: FeedbackCreate, db: Session = Depends(get_db)):
    new_feedback = Feedback(**feedback.dict())
    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)
    return new_feedback