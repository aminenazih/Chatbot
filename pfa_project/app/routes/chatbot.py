from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.ai_service import generate_text

router = APIRouter()

# Request model for the chatbot's question
class QuestionRequest(BaseModel):
    question: str
    context: str

# Endpoint to generate a response from the chatbot
@router.post("/chatbot/ask")
async def ask_chatbot(request: QuestionRequest):
    """
    Generates an answer based on the user's question and context using Gemini API.
    """
    try:
        prompt = f"Context: {request.context}\nQuestion: {request.question}\nAnswer:"
        
        # Use AI Service to generate text
        response = generate_text(prompt)
        
        # Return the generated response
        return {"answer": response}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
