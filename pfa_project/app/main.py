from typing import Any, Dict, List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from bson import ObjectId
import os
import logging
import uuid
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient

# Import services
from app.services.pdf_reader import PDFReader
from app.services.ai_service import answer_question 
from app.services.ai_service import summarize_text_locally # Assuming your AI service is correctly set up

# MongoDB configuration
MONGODB_URL = "mongodb://localhost:27017"
MONGO_DB_NAME = "pfe"
client = AsyncIOMotorClient(MONGODB_URL)
db = client[MONGO_DB_NAME]
pdf_collection = db["pdf_collection"]

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize FastAPI app
app = FastAPI(
    title="PDF Analysis API",
    description="API for PDF document processing and analysis",
    version="1.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class DocumentResponse(BaseModel):
    id: str
    filename: str
    preview: str

class QuestionRequest(BaseModel):
    document_id: str
    question: str

class AnswerResponse(BaseModel):
    answer: str
    document_title: str
    confidence: Optional[float] = None

# Helper functions
def get_pdf_reader():
    return PDFReader()

# Routes
@app.post("/upload/", response_model=DocumentResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    pdf_reader: PDFReader = Depends(get_pdf_reader)
):
    """Upload a PDF file and process it."""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        file_bytes = await file.read()
        with open(file_path, "wb") as f:
            f.write(file_bytes)

        # Extract text from PDF
        extracted_text = pdf_reader.extract_text_from_pdf(file_path)
        
        # Handle markdown conversion safely
        try:
            markdown_text = pdf_reader.convert_text_to_markdown(extracted_text)
        except Exception as md_error:
            logger.warning(f"Markdown conversion failed: {str(md_error)}")
            # Fallback to plain text if markdown conversion fails
            markdown_text = extracted_text
        
        # Save to database
        doc = {
            "filename": file.filename,
            "extracted_text": extracted_text,
            "markdown_text": markdown_text,
            "uploaded_at": datetime.utcnow()
        }
        result = await pdf_collection.insert_one(doc)
        
        # Clean up
        os.remove(file_path)
        
        return DocumentResponse(
            id=str(result.inserted_id),
            filename=file.filename,
            preview=extracted_text[:200] + "..." if len(extracted_text) > 200 else extracted_text
        )
        
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/ask/", response_model=AnswerResponse)
async def ask_question(request: QuestionRequest):
    """Answer a question about a document."""
    try:
        if not ObjectId.is_valid(request.document_id):
            raise HTTPException(status_code=400, detail="Invalid document ID")

        document = await pdf_collection.find_one({"_id": ObjectId(request.document_id)})
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
            
        # Get relevant text content from the document
        context = document["extracted_text"]
        
        # Use the AI service to generate an answer
        result = answer_question(question=request.question, context=context)
        
        # Handle case where AI service doesn't return an answer
        if not result or "answer" not in result:
            raise HTTPException(status_code=500, detail="AI service failed to generate an answer.")
        
        # Return the generated response
        return AnswerResponse(
            answer=result["answer"],
            document_title=document["filename"],
            confidence=result.get("confidence", None)
        )
        
    except Exception as e:
        logger.error(f"Question answering failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents/", response_model=List[Dict[str, Any]])
async def list_documents():
    """List all uploaded documents."""
    try:
        cursor = pdf_collection.find({}, {"extracted_text": 0, "markdown_text": 0})
        documents = await cursor.to_list(length=50)
        
        # Convert ObjectId to string
        for doc in documents:
            doc["_id"] = str(doc["_id"])
            if "uploaded_at" in doc:
                doc["uploaded_at"] = doc["uploaded_at"].isoformat()
                
        return documents
        
    except Exception as e:
        logger.error(f"Error listing documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Service is running"}
@app.get("/summarize/{document_id}")
async def summarize_document(document_id: str):
    """Summarize a document locally without using Gemini or external APIs."""
    try:
        if not ObjectId.is_valid(document_id):
            raise HTTPException(status_code=400, detail="Invalid document ID")

        document = await pdf_collection.find_one({"_id": ObjectId(document_id)})
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        text = document.get("extracted_text", "")
        if not text.strip():
            raise HTTPException(status_code=400, detail="No text found to summarize")

        summary = summarize_text_locally(text)

        return {
            "document_id": document_id,
            "summary": summary
        }

    except Exception as e:
        logger.error(f"Summarization failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Summarization failed")