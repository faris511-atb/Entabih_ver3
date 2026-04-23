from pydantic import BaseModel

class FeedbackCreate(BaseModel):
    feedback_text: str
    selected_tag: str
    rating: int

class FeedbackResponse(FeedbackCreate):
    feedback_id: int

    class Config:
         from_attributes = True
