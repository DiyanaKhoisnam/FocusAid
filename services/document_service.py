import os
import uuid
from pathlib import Path
from typing import Optional
from fastapi import HTTPException, status, UploadFile
from datetime import datetime
import PyPDF2
import io
from openai import OpenAI
from core.storage import documents_db, summaries_db, generate_id
from core.config import settings

# Directory for storing uploaded documents
UPLOAD_DIR = Path("static/documents")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Limits
MAX_FILE_SIZE = settings.MAX_FILE_SIZE_MB * 1024 * 1024  # Convert MB to bytes
MAX_TEXT_LENGTH = settings.MAX_TEXT_LENGTH
MAX_PDF_PAGES = settings.MAX_PDF_PAGES
MAX_SUMMARY_LENGTH = settings.MAX_SUMMARY_LENGTH
# OpenAI limits (gpt-4o-mini has ~128k token context, but we use ~16k chars for safety and cost)
MAX_TEXT_FOR_SUMMARY = 16000  # Characters (roughly 4000 tokens, but model can handle more)

# Initialize OpenAI client (will use API key from environment)
openai_client = None

def get_openai_client():
    """Get or create OpenAI client"""
    global openai_client
    if openai_client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="OPENAI_API_KEY not configured. Please set it in your environment variables."
            )
        openai_client = OpenAI(api_key=api_key)
    return openai_client

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    try:
        pdf_file = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        # Check page limit
        num_pages = len(pdf_reader.pages)
        if num_pages > MAX_PDF_PAGES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"PDF has {num_pages} pages. Maximum allowed is {MAX_PDF_PAGES} pages."
            )
        
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to extract text from PDF: {str(e)}"
        )

def extract_text_from_txt(file_content: bytes) -> str:
    """Extract text from text file"""
    try:
        # Try UTF-8 first, fallback to latin-1
        try:
            return file_content.decode('utf-8')
        except UnicodeDecodeError:
            return file_content.decode('latin-1')
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to extract text from file: {str(e)}"
        )

async def upload_document(file: UploadFile, user_id: Optional[str] = None) -> dict:
    """
    Upload and process a document (PDF or text file)
    
    Args:
        file: Uploaded file
        user_id: Optional user ID who uploaded the file
    
    Returns:
        Dictionary with document metadata
    """
    try:
        # Validate file type
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in ['.pdf', '.txt']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF and TXT files are supported"
            )
        
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Check file size limit
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size ({file_size / (1024*1024):.2f} MB) exceeds maximum allowed size ({settings.MAX_FILE_SIZE_MB} MB)"
            )
        
        # Extract text based on file type
        if file_ext == '.pdf':
            extracted_text = extract_text_from_pdf(file_content)
            file_type = "pdf"
        else:  # .txt
            extracted_text = extract_text_from_txt(file_content)
            file_type = "txt"
        
        if not extracted_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No text could be extracted from the file"
            )
        
        # Check text length limit
        if len(extracted_text) > MAX_TEXT_LENGTH:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Extracted text ({len(extracted_text)} characters) exceeds maximum allowed length ({MAX_TEXT_LENGTH} characters)"
            )
        
        # Generate document ID
        document_id = generate_id()
        
        # Save file to disk
        filename = f"{document_id}{file_ext}"
        filepath = UPLOAD_DIR / filename
        with open(filepath, 'wb') as f:
            f.write(file_content)
        
        # Store document metadata
        document_data = {
            "filename": file.filename,
            "file_type": file_type,
            "file_size": file_size,
            "filepath": str(filepath),
            "extracted_text": extracted_text,
            "text_length": len(extracted_text),
            "user_id": user_id,
            "uploaded_at": datetime.utcnow()
        }
        documents_db[document_id] = document_data
        
        # Get text preview (first 500 characters)
        text_preview = extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text
        
        return {
            "document_id": document_id,
            "filename": file.filename,
            "file_type": file_type,
            "file_size": file_size,
            "uploaded_at": document_data["uploaded_at"],
            "text_preview": text_preview
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process document: {str(e)}"
        )

async def generate_summary(
    document_id: str,
    max_length: int = 200,
    focus: Optional[str] = None
) -> dict:
    """
    Generate a summary of a document using OpenAI
    
    Args:
        document_id: ID of the document to summarize
        max_length: Maximum length of summary in words
        focus: Optional focus area for summary
    
    Returns:
        Dictionary with summary information
    """
    try:
        # Get document
        if document_id not in documents_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        document = documents_db[document_id]
        text = document["extracted_text"]
        original_length = len(text)
        
        # Validate summary length
        if max_length > MAX_SUMMARY_LENGTH:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Maximum summary length ({max_length} words) exceeds allowed limit ({MAX_SUMMARY_LENGTH} words)"
            )
        
        # Check if summary already exists
        if document_id in summaries_db:
            existing_summary = summaries_db[document_id]
            # Return existing summary if parameters match
            if (existing_summary.get("max_length") == max_length and 
                existing_summary.get("focus") == focus):
                return {
                    "document_id": document_id,
                    "summary": existing_summary["summary"],
                    "original_length": original_length,
                    "summary_length": len(existing_summary["summary"]),
                    "created_at": existing_summary["created_at"]
                }
        
        # Truncate text if too long for OpenAI (to fit within token limits)
        # gpt-3.5-turbo has ~4096 token context, we reserve ~500 tokens for prompt/response
        # So we can use ~3500 tokens for input text (~10,500 characters)
        if len(text) > MAX_TEXT_FOR_SUMMARY:
            text = text[:MAX_TEXT_FOR_SUMMARY] + "\n\n[Text truncated due to length limits...]"
        
        # Prepare prompt for OpenAI
        focus_text = f" Focus on: {focus}." if focus else ""
        prompt = f"""Summarize the following document accurately in 6–8 bullet points.

Do not add anything that is not in the text.

Preserve specific details, names, organizations, and numbers exactly.

If the document is a resume, summarize sections like Objective, Education, Experience, and Projects.{focus_text}

Text:

{text}

Summary:"""
        
        # Generate summary using OpenAI
        client = get_openai_client()
        try:
            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,  # Configurable: gpt-4o-mini (better), gpt-4 (best), gpt-3.5-turbo (cheaper)
                messages=[
                    {"role": "system", "content": "You are a precise document summarizer. You create accurate bullet-point summaries that preserve all specific details, names, organizations, and numbers exactly as they appear in the source text. You never add information that is not in the original document."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,  # More tokens for better detailed summaries
                temperature=0.1  # Very low temperature for maximum accuracy and consistency
            )
        except Exception as e:
            error_msg = str(e).lower()
            if "rate limit" in error_msg or "quota" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="OpenAI API rate limit exceeded. Please try again later."
                )
            elif "insufficient_quota" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail="OpenAI API quota exceeded. Please check your API account."
                )
            elif "context_length" in error_msg or "token" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Document is too long for summarization. Please use a shorter document."
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"OpenAI API error: {str(e)}"
                )
        
        summary = response.choices[0].message.content.strip()
        
        # Store summary
        summary_data = {
            "document_id": document_id,
            "summary": summary,
            "max_length": max_length,
            "focus": focus,
            "created_at": datetime.utcnow()
        }
        summaries_db[document_id] = summary_data
        
        return {
            "document_id": document_id,
            "summary": summary,
            "original_length": original_length,
            "summary_length": len(summary),
            "created_at": summary_data["created_at"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate summary: {str(e)}"
        )

def get_document(document_id: str) -> Optional[dict]:
    """Get document by ID"""
    return documents_db.get(document_id)

def delete_document(document_id: str) -> bool:
    """Delete a document and its associated files"""
    try:
        if document_id not in documents_db:
            return False
        
        document = documents_db[document_id]
        filepath = Path(document["filepath"])
        
        # Delete file from disk
        if filepath.exists():
            filepath.unlink()
        
        # Remove from storage
        del documents_db[document_id]
        
        # Remove summary if exists
        if document_id in summaries_db:
            del summaries_db[document_id]
        
        return True
    except Exception:
        return False

