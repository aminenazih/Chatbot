from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from app.services.pdf_reader import PDFReader
from app.db.mongo import pdf_collection
from datetime import datetime
import os
import logging
import uuid
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Ensure upload directory exists
os.makedirs("uploads", exist_ok=True)

@router.post("/upload-and-extract/")
async def upload_and_extract(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    """
    Upload a PDF file, extract text, and convert to Markdown.
    
    Args:
        file: The uploaded PDF file
        background_tasks: Optional background tasks for async processing
        
    Returns:
        JSON response with processing results
    """
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Initialize PDFReader
        pdf_reader = PDFReader()
        
        # Read the PDF bytes
        file_bytes = await file.read()
        
        # Create a unique filename to prevent collisions
        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        file_path = f"uploads/{unique_filename}"
        
        # Save file to disk temporarily
        with open(file_path, "wb") as f:
            f.write(file_bytes)
            
        # Extract text from PDF
        extracted_text = pdf_reader.extract_text_from_pdf(file_path)
        
        # Get document structure for additional metadata
        document_structure = pdf_reader.extract_document_structure(file_path)
        
        # Convert extracted text to Markdown
        markdown_text = pdf_reader.convert_text_to_markdown(extracted_text)
        
        # Save to MongoDB
        doc = {
            "filename": file.filename,
            "file_data": file_bytes,
            "extracted_text": extracted_text,
            "markdown_text": markdown_text,
            "document_structure": document_structure,
            "uploaded_at": datetime.utcnow(),
            "file_size": len(file_bytes),
            "processing_status": "completed"
        }
        
        result = await pdf_collection.insert_one(doc)
        
        # Schedule cleanup in background
        if background_tasks:
            background_tasks.add_task(os.remove, file_path)
        else:
            # Clean up temporary file immediately if no background tasks
            os.remove(file_path)
        
        logger.info(f"Successfully processed PDF: {file.filename}")
        
        return {
            "message": "File uploaded and processed successfully.",
            "id": str(result.inserted_id),
            "filename": file.filename,
            "preview": extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text,
            "markdown_preview": markdown_text[:500] + "..." if len(markdown_text) > 500 else markdown_text,
            "document_info": {
                "page_count": document_structure.get("page_count", 0),
                "has_tables": document_structure.get("has_tables", False),
                "has_images": document_structure.get("has_images", False)
            }
        }
        
    except Exception as e:
        logger.error(f"Error processing PDF: {str(e)}")
        # Attempt to clean up the file if it exists
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@router.post("/extract-with-layout/")
async def extract_with_layout(file: UploadFile = File(...)):
    """
    Upload a PDF file and extract text while preserving more layout information.
    
    Args:
        file: The uploaded PDF file
        
    Returns:
        JSON response with extracted text that preserves layout
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Initialize PDFReader
        pdf_reader = PDFReader()
        
        # Read the PDF bytes
        file_bytes = await file.read()
        
        # Create a unique filename
        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        file_path = f"uploads/{unique_filename}"
        
        # Save file to disk temporarily
        with open(file_path, "wb") as f:
            f.write(file_bytes)
            
        # Extract text with layout preserved
        text_with_layout = pdf_reader.extract_text_with_layout(file_path)
        
        # Convert to markdown
        markdown_text = pdf_reader.convert_text_to_markdown(text_with_layout)
        
        # Clean up temporary file
        os.remove(file_path)
        
        logger.info(f"Successfully extracted text with layout from: {file.filename}")
        
        return {
            "message": "Successfully extracted text with layout preserved.",
            "filename": file.filename,
            "preview": text_with_layout[:500] + "..." if len(text_with_layout) > 500 else text_with_layout,
            "markdown_preview": markdown_text[:500] + "..." if len(markdown_text) > 500 else markdown_text
        }
        
    except Exception as e:
        logger.error(f"Error extracting text with layout: {str(e)}")
        # Attempt to clean up the file if it exists
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error extracting text with layout: {str(e)}")

@router.get("/document/{doc_id}")
async def get_document(doc_id: str):
    """
    Retrieve a processed document by ID.
    
    Args:
        doc_id: The MongoDB document ID
        
    Returns:
        Document details including markdown text
    """
    try:
        from bson.objectid import ObjectId
        
        # Find document in MongoDB
        doc = await pdf_collection.find_one({"_id": ObjectId(doc_id)})
        
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Remove binary data to keep response size reasonable
        if "file_data" in doc:
            del doc["file_data"]
            
        # Convert ObjectId to string for JSON serialization
        doc["_id"] = str(doc["_id"])
        doc["uploaded_at"] = doc["uploaded_at"].isoformat()
        
        return doc
        
    except Exception as e:
        logger.error(f"Error retrieving document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving document: {str(e)}")

@router.post("/process-large-pdf/")
async def process_large_pdf(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    """
    Upload and process a large PDF file in the background.
    
    Args:
        file: The uploaded PDF file
        background_tasks: Background tasks for async processing
        
    Returns:
        Job ID for tracking the background process
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Read the PDF bytes
        file_bytes = await file.read()
        
        # Create a unique job ID
        job_id = str(uuid.uuid4())
        unique_filename = f"{job_id}_{file.filename}"
        file_path = f"uploads/{unique_filename}"
        
        # Save file to disk temporarily
        with open(file_path, "wb") as f:
            f.write(file_bytes)
            
        # Create initial document in MongoDB
        doc = {
            "job_id": job_id,
            "filename": file.filename,
            "file_size": len(file_bytes),
            "uploaded_at": datetime.utcnow(),
            "processing_status": "pending"
        }
        
        await pdf_collection.insert_one(doc)
        
        # Start background processing
        if background_tasks:
            background_tasks.add_task(process_pdf_in_background, file_path, job_id, file.filename)
            
            return {
                "message": "PDF queued for processing",
                "job_id": job_id,
                "status": "processing"
            }
        else:
            # If no background tasks available, process synchronously
            return await upload_and_extract(file)
            
    except Exception as e:
        logger.error(f"Error queueing PDF: {str(e)}")
        # Attempt to clean up the file if it exists
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error queueing PDF: {str(e)}")

async def process_pdf_in_background(file_path: str, job_id: str, filename: str):
    """
    Process a PDF file in the background.
    
    Args:
        file_path: Path to the temporary PDF file
        job_id: Unique job identifier
        filename: Original filename
    """
    try:
        # Initialize PDFReader
        pdf_reader = PDFReader()
        
        # Update status to processing
        await pdf_collection.update_one(
            {"job_id": job_id},
            {"$set": {"processing_status": "processing"}}
        )
        
        # Extract text from PDF
        extracted_text = pdf_reader.extract_text_from_pdf(file_path)
        
        # Get document structure
        document_structure = pdf_reader.extract_document_structure(file_path)
        
        # Convert to markdown
        markdown_text = pdf_reader.convert_text_to_markdown(extracted_text)
        
        # Update MongoDB document with results
        await pdf_collection.update_one(
            {"job_id": job_id},
            {"$set": {
                "extracted_text": extracted_text,
                "markdown_text": markdown_text,
                "document_structure": document_structure,
                "processing_status": "completed",
                "completed_at": datetime.utcnow()
            }}
        )
        
        logger.info(f"Background processing completed for job: {job_id}")
        
    except Exception as e:
        logger.error(f"Background processing failed for job {job_id}: {str(e)}")
        # Update status to failed
        await pdf_collection.update_one(
            {"job_id": job_id},
            {"$set": {
                "processing_status": "failed",
                "error_message": str(e),
                "failed_at": datetime.utcnow()
            }}
        )
    finally:
        # Clean up temporary file
        if os.path.exists(file_path):
            os.remove(file_path)