import os
import uuid
import re
from pathlib import Path
from typing import Optional
from fastapi import HTTPException, status, UploadFile
from datetime import datetime
import PyPDF2
import io
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

# No external API needed - using rule-based processing

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
    Generate a summary of a document using rule-based extraction
    
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
            raise Exception("Document not found")
        
        document = documents_db[document_id]
        text = document["extracted_text"]
        original_length = len(text)
        
        # Validate summary length
        if max_length > MAX_SUMMARY_LENGTH:
            max_length = MAX_SUMMARY_LENGTH  # Cap it instead of raising error
        
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
        
        # Generate summary using rule-based extraction (no API needed)
        # Extract key sentences and create bullet points
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 20]  # Filter short sentences
        
        # If no sentences found, use paragraphs
        if not sentences:
            paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
            if paragraphs:
                sentences = [p[:200] for p in paragraphs[:5]]
            else:
                # Last resort: use first part of text
                sentences = [text[:300]]
        
        # Score sentences by importance (longer sentences with key words are more important)
        important_keywords = ["important", "key", "main", "primary", "essential", "critical", 
                             "significant", "result", "finding", "conclusion", "summary",
                             "note", "remember", "focus", "must", "should", "need"]
        
        scored_sentences = []
        for sentence in sentences:
            if not sentence:
                continue
            score = len(sentence)  # Longer sentences get higher base score
            # Boost score for important keywords
            for keyword in important_keywords:
                if keyword.lower() in sentence.lower():
                    score += 50
            # Boost score for numbers (often important data)
            if re.search(r'\d+', sentence):
                score += 30
            scored_sentences.append((score, sentence))
        
        # Sort by score and take top sentences
        if scored_sentences:
            scored_sentences.sort(reverse=True, key=lambda x: x[0])
            num_points = min(max_length // 20, 8, len(scored_sentences))  # Roughly 8 bullet points
            top_sentences = scored_sentences[:num_points]
        else:
            # Fallback: use first few sentences
            top_sentences = [(0, s) for s in sentences[:5]]
        
        # Create summary as bullet points
        summary_points = []
        for _, sentence in top_sentences:
            # Clean up sentence
            sentence = sentence.strip()
            if sentence:
                # Capitalize first letter
                if len(sentence) > 1:
                    sentence = sentence[0].upper() + sentence[1:]
                else:
                    sentence = sentence.upper()
                summary_points.append(f"• {sentence}")
        
        summary = "\n".join(summary_points) if summary_points else "• " + text[:200] + "..."
        
        # If summary is too short, add more sentences
        if len(summary.split()) < max_length // 2 and len(scored_sentences) > len(summary_points):
            additional = scored_sentences[len(summary_points):min(len(summary_points) + 3, len(scored_sentences))]
            for _, sentence in additional:
                sentence = sentence.strip()
                if sentence:
                    if len(sentence) > 1:
                        sentence = sentence[0].upper() + sentence[1:]
                    else:
                        sentence = sentence.upper()
                    summary += f"\n• {sentence}"
        
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
        
    except Exception as e:
        # Return a simple fallback summary instead of raising error
        print(f"Error in generate_summary: {str(e)}")
        import traceback
        print(traceback.format_exc())
        
        # Get document for fallback
        text = ""
        if document_id in documents_db:
            text = documents_db[document_id].get("extracted_text", "")
            if text:
                sentences = [s.strip() for s in text.split('.') if s.strip()][:5]
                summary = '• ' + '\n• '.join(sentences) + '.' if sentences else "• " + text[:200] + "..."
            else:
                summary = "• Summary could not be generated - no text found."
        else:
            summary = "• Summary could not be generated - document not found."
        
        return {
            "document_id": document_id,
            "summary": summary,
            "original_length": len(text),
            "summary_length": len(summary),
            "created_at": datetime.utcnow()
        }

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

