from fastapi import APIRouter, HTTPException
from app.services.pdf_reader import extract_text_from_pdf
from app.services.ai_service import summarize_text_locally

router = APIRouter()

@router.get("/summarize/{filename}")
async def summarize_pdf(filename: str):
    try:
        pdf_path = f"./uploads/{filename}"
        text = extract_text_from_pdf(pdf_path)
        summary = summarize_text_locally(text)
        return {"filename": filename, "summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
