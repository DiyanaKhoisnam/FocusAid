from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DocumentUploadResponse(BaseModel):
    """Response model for document upload"""
    document_id: str = Field(..., description="Unique ID of the uploaded document")
    filename: str = Field(..., description="Original filename")
    file_type: str = Field(..., description="Type of file (pdf, txt, etc.)")
    file_size: int = Field(..., description="File size in bytes")
    uploaded_at: datetime = Field(..., description="Upload timestamp")
    text_preview: Optional[str] = Field(default=None, description="First 500 characters of extracted text")

class SummaryRequest(BaseModel):
    """Request model for generating summary"""
    document_id: str = Field(..., description="ID of the document to summarize")
    max_length: Optional[int] = Field(default=200, ge=50, le=500, description="Maximum length of summary in words (50-500)")
    focus: Optional[str] = Field(default=None, max_length=100, description="Focus area for summary (e.g., 'key points', 'main ideas')")

class SummaryResponse(BaseModel):
    """Response model for document summary"""
    document_id: str = Field(..., description="ID of the summarized document")
    summary: str = Field(..., description="Generated summary")
    original_length: int = Field(..., description="Length of original text in characters")
    summary_length: int = Field(..., description="Length of summary in characters")
    created_at: datetime = Field(..., description="Summary creation timestamp")

