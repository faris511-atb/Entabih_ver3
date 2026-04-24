# uvicorn main:app --reload --host 0.0.0.0 --port 8000
import os
import re
import httpx

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

from fastapi import File, UploadFile, Form
from pdf_utils import extract_text


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

# pdf scaning
@app.post("/scan-pdf")
async def scan_pdf(
    file: UploadFile = File(...),
    user_prompt: str = Form(...)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        pdf_text = extract_text(pdf_bytes, max_chars=4000)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    if not pdf_text:
        raise HTTPException(status_code=422, detail="Could not extract text from this PDF.")

    combined_prompt = (
    f"You are an expert document analyst.\n\n"
    f"The user has uploaded a document and asks:\n"
    f"\"{user_prompt}\"\n\n"
    f"Document content:\n\"{pdf_text}\"\n\n"
    f"Based on the user's specific question, analyze the document carefully.\n\n"
    f"If the question is about AI-generated content: look for repetitive phrasing, "
    f"lack of personal voice, overly formal structure, no spelling mistakes, "
    f"and generic language patterns typical of AI.\n\n"
    f"If the question is about fraud or forgery: look for inconsistencies, "
    f"suspicious requests, pressure language, fake authority claims.\n\n"
    f"If the question is about professionalism: evaluate language quality, "
    f"structure, and clarity.\n\n"
    f"Score the document from 0 to 100 where:\n"
    f"- 100 = the document FULLY matches what the user is worried about "
    f"(e.g. fully AI-generated, fully fraudulent, fully unprofessional)\n"
    f"- 0 = the document is completely clean from the user's concern\n\n"
    f"IMPORTANT: Return ONLY a single integer between 0 and 100. No words. Just the number."
)

    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

    async with httpx.AsyncClient() as client:

        # Get score
        try:
            score_response = await client.post(
                OPENROUTER_API_URL,
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "exp://localhost"
                },
                json={
                    "model": "openai/gpt-3.5-turbo",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a document analysis expert. Respond with ONLY a number between 0 and 100. Nothing else."
                        },
                        {"role": "user", "content": combined_prompt}
                    ],
                    "temperature": 0.1,
                    "max_tokens": 5
                },
                timeout=30.0
            )

            raw = score_response.json()["choices"][0]["message"]["content"].strip()
            match = re.search(r"\d{1,3}(?:\.\d+)?", raw)
            score = float(match.group()) if match else 50.0
            score = max(0.0, min(100.0, score))

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to score document: {str(e)}")

        # Get message
        message_prompt = (
    f"You are an expert document analyst.\n\n"
    f"User's question: \"{user_prompt}\"\n"
    f"Document excerpt: \"{pdf_text[:2000]}\"\n"
    f"Analysis score: {score:.0f}/100 "
    f"(100 = fully matches the concern, 0 = completely clean)\n\n"
    f"Write a clear, honest, direct Arabic analysis (2-3 sentences) that:\n"
    f"1. Directly answers the user's question with a clear YES or NO first.\n"
    f"2. Explains the main evidence you found in the document.\n"
    f"3. Gives a practical recommendation.\n\n"
    f"Be honest and specific. Do not be vague. "
    f"If the document shows AI writing, say so clearly. "
    f"If it is fraud, say so clearly.\n"
    f"Write in formal Arabic only."
)

        try:
            message_response = await client.post(
                OPENROUTER_API_URL,
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "exp://localhost"
                },
                json={
                    "model": "openai/gpt-3.5-turbo",
                    "messages": [
                        {
                            "role": "system",
                            "content": "أنت خبير في تحليل المستندات. أجب باللغة العربية الفصحى بشكل مختصر ومباشر."
                        },
                        {"role": "user", "content": message_prompt}
                    ],
                    "temperature": 0.4,
                    "max_tokens": 200
                },
                timeout=30.0
            )

            message = message_response.json()["choices"][0]["message"]["content"].strip()

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate message: {str(e)}")

    return {
        "score": score,
        "message": message
    }

# # Test route
# @app.get("/test")
# def test_message():
#     return {"message": "No God except Allah!"}
