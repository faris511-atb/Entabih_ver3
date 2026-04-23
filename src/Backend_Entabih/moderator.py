import os
from dotenv import load_dotenv
from fastapi import HTTPException
from openai import OpenAI

# تحميل المتغيرات البيئية
load_dotenv()

# قراءة المفتاح
OPENAI_API_KEY = os.getenv("OPENROUTER_API_KEY")

if not OPENAI_API_KEY:
    raise RuntimeError("❌ لم يتم العثور على مفتاح OpenAI الصحيح")

# تهيئة النموذج
client = OpenAI(
    api_key=OPENAI_API_KEY,
    base_url="https://openrouter.ai/api/v1"
)

# توليد البرومبت
def build_moderation_prompt(title: str, description: str, email: str, phone: str) -> str:
    return f"""
You are an AI assistant reviewing Arabic user reports about suspicious messages or scams.

Your job is *not* to judge if the content is a scam, but to verify if the report is serious, clear, and complete.

Check:
1. Is the title clear and meaningful?
2. Does the description include logical details?
3. Is the report free of nonsense or meaningless words (e.g., ههه، تجريب، ...etc)?
4. Does the report contain meaningful data (e.g., number, link, or actual message)?

Reply with **only one word in Arabic**:
- "جيد" = if the report is serious and complete
- "سيء" = if the report is incomplete, vague, or not useful

بلاغ المستخدم:
- العنوان: {title}
- الوصف: {description}
- البريد الإلكتروني: {email}
- رقم الهاتف: {phone}
""".strip()

# المنطق الرئيسي للمراجعة
async def moderate_report_logic(title: str, description: str, email: str, phone: str) -> str:
    prompt = build_moderation_prompt(title, description, email, phone)

    try:
        response = client.chat.completions.create(
            model="openai/gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        return response.choices[0].message.content.strip()
    except Exception:
        raise HTTPException(status_code=500, detail="فشل في الاتصال بـ OpenRouter")