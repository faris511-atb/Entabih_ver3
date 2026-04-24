# pdf_utils.py
import fitz  # PyMuPDF

def extract_text(pdf_bytes: bytes, max_chars: int = 4000) -> str:
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        full_text = ""

        for page in doc:
            full_text += page.get_text()
            if len(full_text) >= max_chars:
                break

        doc.close()
        text = full_text.strip()

        if not text:
            return ""

        return text[:max_chars]

    except Exception as e:
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")
