# detector.py
# detector.py
from pydantic import BaseModel
from fastapi import HTTPException
import httpx
import os
import re
from dotenv import load_dotenv

load_dotenv()

# Data models
class FraudCheckRequest(BaseModel):
    message: str

class FraudCheckResponse(BaseModel):
    classification: str
    percentage: float
    advice: str

# Constants
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY environment variable is not set")

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Classification logic
# percentage = SAFETY score (0 = very dangerous, 100 = fully safe)
# Matches the app UI which shows "نسبة سلامة النص"
def classify_message(percentage: float) -> str:
    if percentage >= 75:
        return "لم يتم رصد أي سلوك احتيالي"
    elif percentage >= 40:
        return "مشبوه"
    else:
        return "احتيال"


async def detect_fraud(request: FraudCheckRequest) -> FraudCheckResponse:

    analysis_prompt = (
        "You are a doctoral-level AI fraud detection expert specializing in Arabic-language social engineering.\n\n"
        "Analyze the following message and rate its SAFETY (not its fraud risk).\n\n"
        "Return a SAFETY SCORE from 0 to 100:\n"
        "- 100 = completely safe, legitimate message\n"
        "- 75-99 = mostly safe, minor concerns\n"
        "- 40-74 = suspicious, possible fraud attempt\n"
        "- 0-39 = clearly fraudulent\n\n"
        "Fraud indicators to look for:\n"
        "1. Requests for personal info, passwords, OTP codes, or bank details.\n"
        "2. Urgency language ('your account will be closed', 'act now').\n"
        "3. Impersonation of banks, government, or official entities.\n"
        "4. Suspicious or shortened links.\n"
        "5. Threats or fear-inducing language.\n"
        "6. Offers that are too good to be true.\n\n"
        "IMPORTANT: Return ONLY a single integer number between 0 and 100. "
        "No explanation, no text, no label. Just the number.\n\n"
        f"Message to analyze:\n{request.message}"
    )

    async with httpx.AsyncClient() as client:

        # Step 1: Get safety percentage
        try:
            response = await client.post(
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
                            "content": (
                                "You are a fraud detection expert. "
                                "You MUST respond with ONLY a single integer number between 0 and 100. "
                                "No words, no explanation, no punctuation. Just the number."
                            )
                        },
                        {"role": "user", "content": analysis_prompt}
                    ],
                    "temperature": 0.1,
                    "max_tokens": 5
                },
                timeout=30.0
            )

            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="Error from OpenRouter API")

            content = response.json()["choices"][0]["message"]["content"].strip()
            match = re.search(r"\d{1,3}(?:\.\d+)?", content)
            percentage = float(match.group()) if match else 50.0
            percentage = max(0.0, min(100.0, percentage))

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to analyze message: {str(e)}")

        # Step 2: Classify
        classification = classify_message(percentage)

        # Step 3: Generate Arabic advice
        advice_prompt = (
            f"أنت خبير في كشف الاحتيال الرقمي.\n\n"
            f"قمت بتحليل الرسالة التالية وصنّفتها كـ: \"{classification}\" "
            f"بنسبة أمان: {percentage:.0f}%.\n\n"
            f"اكتب نصيحة مباشرة للمستخدم باللغة العربية الفصحى تشمل:\n"
            f"- سبب التصنيف بشكل مختصر.\n"
            f"- ماذا يجب أن يفعل المستخدم الآن.\n\n"
            f"الشروط: جملتان أو ثلاث جمل فقط، واضحة ومباشرة، بدون ترقيم أو عناوين.\n\n"
            f"نص الرسالة:\n{request.message}"
        )

        try:
            advice_response = await client.post(
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
                            "content": "أنت خبير في كشف الاحتيال تقدم نصائح مختصرة وواضحة للمستخدمين العرب."
                        },
                        {"role": "user", "content": advice_prompt}
                    ],
                    "temperature": 0.4,
                    "max_tokens": 200
                },
                timeout=30.0
            )

            if advice_response.status_code != 200:
                raise HTTPException(status_code=500, detail="Error from OpenRouter advice API")

            advice = advice_response.json()["choices"][0]["message"]["content"].strip()

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate advice: {str(e)}")

        return FraudCheckResponse(
            classification=classification,
            percentage=percentage,
            advice=advice
        )






# ----------------------------------------------------------------------------------------------------------------------------------------------


# # detector.py
# # detector.py
# from pydantic import BaseModel
# from fastapi import HTTPException
# import httpx
# import os
# import re
# from dotenv import load_dotenv

# load_dotenv()

# # Data models
# class FraudCheckRequest(BaseModel):
#     message: str

# class FraudCheckResponse(BaseModel):
#     classification: str
#     percentage: float
#     advice: str

# # Constants
# OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
# if not OPENROUTER_API_KEY:
#     raise ValueError("OPENROUTER_API_KEY environment variable is not set")

# OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# # Classification logic
# def classify_message(percentage: float) -> str:
#     if percentage < 50:
#         return "احتيال"
#     elif percentage < 85:
#         return "مشبوه"
#     else:
#         return "لم يتم رصد أي سلوك احتيال"

# # Core logic
# async def detect_fraud(request: FraudCheckRequest) -> FraudCheckResponse:
#     # Prompt with PhD-level detail
#     analysis_prompt = (
#         "You are a highly specialized doctoral-level AI agent trained in advanced fraud detection and Arabic-language social engineering analysis.\n\n"
#         "Your task is to assess the legitimacy of the following Arabic message by evaluating linguistic cues, behavioral patterns, urgency tone, impersonation of institutions, and indicators like unknown URLs, banking references, or phone numbers.\n\n"
#         "Your analysis should reflect a comprehensive judgment based on:\n"
#         "1. Contextual phrasing and psychological triggers.\n"
#         "2. Use of banking terms or impersonation techniques.\n"
#         "3. Suspicious requests such as credential updates or clicking external links.\n"
#         "4. Abnormal formatting, urgency language, or vague sender identity.\n\n"
#         "Return ONLY a number between 0 and 100 representing the legitimacy:\n"
#         "- 0 = definitely fraudulent\n"
#         "- 100 = fully legitimate\n\n"
#         f"Message:\n{request.message}"
#     )

#     async with httpx.AsyncClient() as client:
#         # Get percentage
#         try:
#             response = await client.post(
#                 OPENROUTER_API_URL,
#                 headers={
#                     "Authorization": f"Bearer {OPENROUTER_API_KEY}",
#                     "Content-Type": "application/json",
#                     "HTTP-Referer": "exp://localhost"
#                 },
#                 json={
#                     "model": "openai/gpt-3.5-turbo",
#                     "messages": [
#                         {"role": "system", "content": "You are a fraud detection expert."},
#                         {"role": "user", "content": analysis_prompt}
#                     ],
#                     "temperature": 0.1
#                 },
#                 timeout=30.0
#             )

#             if response.status_code != 200:
#                 raise HTTPException(status_code=500, detail="Error from OpenRouter API")

#             content = response.json()["choices"][0]["message"]["content"].strip()
#             match = re.search(r"\d{1,3}(?:\.\d+)?", content)
#             percentage = float(match.group()) if match else 50
#             percentage = max(0, min(100, percentage))
#         except Exception as e:
#             raise HTTPException(status_code=500, detail=f"Failed to analyze message: {str(e)}")

#         # Get enhanced advice with better prompt and parameters
#         classification = classify_message(percentage)
#         advice_prompt = (
#             f"أنت خبير كشف الاحتيال. الرسالة تم تصنيفها: \"{classification}\" (بنسبة {percentage}%).\n\n"
#             f"قدم نصيحة واضحة ومفصلة عن:\n"
#             f"1. سبب تصنيف الرسالة بهذا الشكل\n"
#             f"2. العلامات المشبوهة التي يجب الانتباه لها\n"
#             f"3. الإجراءات المحددة التي يجب اتخاذها\n\n"
#             f"قدم نصيحة كاملة وواضحة (لا تزيد عن 4-5 جمل) بحيث تكون مفيدة للمستخدم.\n\n"
#             f"الرسالة:\n{request.message}"
#         )

#         try:
#             # Increasing max_tokens to ensure complete advice
#             advice_response = await client.post(
#                 OPENROUTER_API_URL,
#                 headers={
#                     "Authorization": f"Bearer {OPENROUTER_API_KEY}",
#                     "Content-Type": "application/json",
#                     "HTTP-Referer": "exp://localhost"
#                 },
#                 json={
#                     "model": "openai/gpt-3.5-turbo",
#                     "messages": [
#                         {"role": "system", "content": "أنت خبير في كشف الاحتيال تقدم نصائح واضحة ومفيدة للمستخدمين."},
#                         {"role": "user", "content": advice_prompt}
#                     ],
#                     "temperature": 0.3,
#                     "max_tokens": 250
#                 },
#                 timeout=30.0
#             )

#             if advice_response.status_code != 200:
#                 raise HTTPException(status_code=500, detail="Error from OpenRouter advice API")

#             advice = advice_response.json()["choices"][0]["message"]["content"].strip()
            
#             # Check if advice was cut off or too short, and provide default if needed
#             if len(advice) < 20 or advice.endswith("..."):
#                 default_advice = {
#                     "احتيال": "هذه الرسالة احتيالية. تجنب النقر على أي روابط أو الاستجابة لها. قم بحظر المرسل فوراً وتجاهل الرسالة.",
#                     "مشبوه": "هذه الرسالة مشبوهة. تحقق من مصدر الرسالة مباشرة عبر القنوات الرسمية. لا تقم بمشاركة بيانات شخصية أو مالية.",
#                     "لم يتم رصد أي سلوك احتيال": "تبدو هذه الرسالة طبيعية. ومع ذلك، يُنصح دائماً بتوخي الحذر والتحقق من مصادر الاتصالات غير المتوقعة."
#                 }
#                 advice = default_advice.get(classification, "تعامل مع هذه الرسالة بحذر. تأكد من مصدر الرسالة قبل الرد أو اتخاذ أي إجراء.")
#         except Exception as e:
#             # Provide fallback advice in case of errors
#             fallback_advice = {
#                 "احتيال": "هذه الرسالة تحمل علامات الاحتيال. تجنب التفاعل معها وحظر المرسل.",
#                 "مشبوه": "هناك عناصر مشبوهة في هذه الرسالة. يرجى التحقق منها بحذر قبل أي استجابة.",
#                 "لم يتم رصد أي سلوك احتيال": "لم نرصد علامات احتيال واضحة، لكن يُنصح دائماً بالحذر."
#             }
#             advice = fallback_advice.get(classification, "تعامل مع هذه الرسالة بحذر.")
#             # Log error but don't expose it to user
#             print(f"Failed to generate advice: {str(e)}")

#         return FraudCheckResponse(
#             classification=classification,
#             percentage=percentage,
#             advice=advice
#         )
    
# ------------------------------------------------------------------------------

# detector.py
# from pydantic import BaseModel
# from fastapi import HTTPException
# import httpx
# import os
# import re
# from dotenv import load_dotenv

# load_dotenv()

# # Data models
# class FraudCheckRequest(BaseModel):
#     message: str

# class FraudCheckResponse(BaseModel):
#     classification: str
#     percentage: float
#     advice: str

# # Constants
# OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
# if not OPENROUTER_API_KEY:
#     raise ValueError("OPENROUTER_API_KEY environment variable is not set")

# OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# # Classification logic
# def classify_message(percentage: float) -> str:
#     if percentage < 50:
#         return "احتيال"
#     elif percentage < 85:
#         return "مشبوه"
#     else:
#         return "لم يتم رصد أي سلوك احتيال"

# # Core logic
# async def detect_fraud(request: FraudCheckRequest) -> FraudCheckResponse:
#     # Prompt with PhD-level detail
#     analysis_prompt = (
#         "You are a highly specialized doctoral-level AI agent trained in advanced fraud detection and Arabic-language social engineering analysis.\n\n"
#         "Your task is to assess the legitimacy of the following Arabic message by evaluating linguistic cues, behavioral patterns, urgency tone, impersonation of institutions, and indicators like unknown URLs, banking references, or phone numbers.\n\n"
#         "Your analysis should reflect a comprehensive judgment based on:\n"
#         "1. Contextual phrasing and psychological triggers.\n"
#         "2. Use of banking terms or impersonation techniques.\n"
#         "3. Suspicious requests such as credential updates or clicking external links.\n"
#         "4. Abnormal formatting, urgency language, or vague sender identity.\n\n"
#         "Return ONLY a number between 0 and 100 representing the legitimacy:\n"
#         "- 0 = definitely fraudulent\n"
#         "- 100 = fully legitimate\n\n"
#         f"Message:\n{request.message}"
#     )

#     async with httpx.AsyncClient() as client:
#         # Get percentage
#         try:
#             response = await client.post(
#                 OPENROUTER_API_URL,
#                 headers={
#                     "Authorization": f"Bearer {OPENROUTER_API_KEY}",
#                     "Content-Type": "application/json",
#                     "HTTP-Referer": "exp://localhost"
#                 },
#                 json={
#                     "model": "openai/gpt-3.5-turbo",
#                     "messages": [
#                         {"role": "system", "content": "You are a fraud detection expert."},
#                         {"role": "user", "content": analysis_prompt}
#                     ],
#                     "temperature": 0.1
#                 },
#                 timeout=30.0
#             )

#             if response.status_code != 200:
#                 raise HTTPException(status_code=500, detail="Error from OpenRouter API")

#             content = response.json()["choices"][0]["message"]["content"].strip()
#             match = re.search(r"\d{1,3}(?:\.\d+)?", content)
#             percentage = float(match.group()) if match else 50
#             percentage = max(0, min(100, percentage))
#         except Exception as e:
#             raise HTTPException(status_code=500, detail=f"Failed to analyze message: {str(e)}")

#         # Get concise single-sentence advice with description
#         classification = classify_message(percentage)
#         advice_prompt = (
#             f"أنت خبير كشف الاحتيال. الرسالة تم تصنيفها: \"{classification}\" (بنسبة {percentage}%).\n\n"
#             f"قدم إجابة من جزئين فقط مفصولين بفاصلة منقوطة (؛):\n"
#             f"1. وصف سبب تصنيف الرسالة بهذا الشكل في جملة واحدة فقط\n"
#             f"2. نصيحة محددة وواضحة حول كيفية التعامل مع هذه الرسالة في جملة واحدة فقط\n\n"
#             f"مثال: هذه الرسالة تحتوي على روابط مشبوهة وطلبات عاجلة؛ تجنب النقر على أي روابط وتواصل مع الجهة الرسمية عبر قنواتها المعروفة.\n\n"
#             f"الرسالة:\n{request.message}"
#         )

#         try:
#             # Increasing max_tokens to ensure complete advice but not too long
#             advice_response = await client.post(
#                 OPENROUTER_API_URL,
#                 headers={
#                     "Authorization": f"Bearer {OPENROUTER_API_KEY}",
#                     "Content-Type": "application/json",
#                     "HTTP-Referer": "exp://localhost"
#                 },
#                 json={
#                     "model": "openai/gpt-3.5-turbo",
#                     "messages": [
#                         {"role": "system", "content": "أنت خبير في كشف الاحتيال تقدم تحليلات موجزة ونصائح مباشرة بجملة واحدة لكل منهما."},
#                         {"role": "user", "content": advice_prompt}
#                     ],
#                     "temperature": 0.2,
#                     "max_tokens": 150
#                 },
#                 timeout=30.0
#             )

#             if advice_response.status_code != 200:
#                 raise HTTPException(status_code=500, detail="Error from OpenRouter advice API")

#             advice = advice_response.json()["choices"][0]["message"]["content"].strip()
            
#             # Check if advice was cut off or too short, and provide default if needed
#             if len(advice) < 20 or advice.endswith("...") or ";" not in advice:
#                 default_advice = {
#                     "احتيال": "تحتوي الرسالة على طلبات مشبوهة وأسلوب ضغط؛ تجاهل الرسالة تماماً وقم بحظر المرسل فوراً.",
#                     "مشبوه": "تستخدم الرسالة لغة غامضة وتفتقر لتفاصيل التحقق؛ اتصل بالجهة المعنية عبر أرقامها الرسمية للتأكد قبل اتخاذ أي إجراء.",
#                     "لم يتم رصد أي سلوك احتيال": "الرسالة لا تحتوي على مؤشرات احتيال واضحة؛ يمكنك التعامل معها بشكل طبيعي مع الالتزام بإجراءات الأمان العامة."
#                 }
#                 advice = default_advice.get(classification, "يصعب تحديد مصداقية الرسالة بشكل قاطع؛ تحقق من المصدر قبل الاستجابة أو مشاركة أي معلومات.")
#         except Exception as e:
#             # Provide fallback advice in case of errors
#             fallback_advice = {
#                 "احتيال": "الرسالة تحتوي على نمط احتيالي معروف؛ تجاهل الرسالة وابلغ عنها كمحتوى احتيالي.",
#                 "مشبوه": "الرسالة تحتوي على عناصر مشبوهة غير معتادة؛ لا تستجب وتحقق من المصدر عبر قنوات اتصال رسمية.",
#                 "لم يتم رصد أي سلوك احتيال": "لم نكتشف أي مؤشرات احتيال في الرسالة؛ يمكنك التعامل معها بشكل اعتيادي."
#             }
#             advice = fallback_advice.get(classification, "لا يمكن تحديد طبيعة الرسالة بدقة؛ توخ الحذر ولا تشارك معلومات حساسة.")
#             # Log error but don't expose it to user
#             print(f"Failed to generate advice: {str(e)}")

#         return FraudCheckResponse(
#             classification=classification,
#             percentage=percentage,
#             advice=advice
#         )