# uvicorn main:app --reload --host 0.0.0.0 --port 8000
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database import SessionLocal, Base, engine
from schemas import users as user_schema
from schemas import reports
from schemas.reports import ReportCreate, ReportResponse

from detector import detect_fraud, FraudCheckRequest, FraudCheckResponse
from controllers import user_controller, report_controller, feedback_controller
from moderator import moderate_report_logic  # ✅ استخدم الملف المنفصل

Base.metadata.create_all(bind=engine)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")
app = FastAPI()
app.include_router(feedback_controller.router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Register
@app.post("/register")
def register(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    return user_controller.register_user(user, db)

# Login
@app.post("/login")
def login(user: user_schema.UserLogin, db: Session = Depends(get_db)):
    return user_controller.login_user(user, db)

# Logout
@app.post("/logout")
def logout(request: Request, token: str = Depends(oauth2_scheme)):
    print(f"Logging out token: {token}")
    return {"message": "Signed out successfully"}

# Create report
@app.post("/send-report", response_model=ReportResponse)
async def send_report(report: ReportCreate, db: Session = Depends(get_db)):
    # ✅ مراجعة البلاغ
    classification = await moderate_report_logic(
        title=report.title,
        description=report.description,
        email=report.email or "",
        phone=report.phone_number or ""
    )

    if classification.strip() != "جيد":
        raise HTTPException(status_code=400, detail="❌ تم رفض البلاغ لأنه غير مكتمل أو غير جاد")

    # ✅ إذا كان جيد يتم حفظه
    return report_controller.create_report(report, db)

# Get reports
@app.get("/get-reports", response_model=list[reports.ReportResponse])
def get_reports(db: Session = Depends(get_db)):
    return report_controller.get_reports(db)

# AI fraud detection
@app.post("/detect", response_model=FraudCheckResponse)
async def detect(request: FraudCheckRequest):
    return await detect_fraud(request)

# AI moderation of report
@app.post("/moderate-report")
async def moderate_report(request: Request):
    data = await request.json()
    title = data.get("title", "")
    description = data.get("description", "")
    email = data.get("email", "")
    phone_number = data.get("phone_number", "")

    classification = await moderate_report_logic(title, description, email, phone_number)
    return {"classification": classification}

# # Test route
# @app.get("/test")
# def test_message():
#     return {"message": "No God except Allah!"}
