from fastapi import APIRouter, HTTPException, status, UploadFile, File
from typing import Optional

from schemas.document import DocumentUploadResponse, SummaryRequest, SummaryResponse
from services.document_service import (
    upload_document,
    generate_summary,
    get_document,
    delete_document
)

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload", response_model=DocumentUploadResponse, status_code=201)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a PDF or text file for processing.
    
    Supports PDF and TXT files. The text will be extracted and stored.
    Authentication removed for hackathon demo.
    """
    result = await upload_document(file, user_id=None)
    return DocumentUploadResponse(**result)


@router.post("/summarize", response_model=SummaryResponse, status_code=200)
async def summarize_document(request: SummaryRequest):
    """
    Generate a summary of an uploaded document using AI.
    
    Requires a document to be uploaded first via /upload endpoint.
    Authentication removed for hackathon demo.
    """
    result = await generate_summary(
        document_id=request.document_id,
        max_length=request.max_length,
        focus=request.focus
    )
    return SummaryResponse(**result)


@router.get("/{document_id}")
async def get_document_info(document_id: str):
    """
    Get information about an uploaded document.
    Authentication removed for hackathon demo.
    """
    document = get_document(document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Return document info (without full text for large documents)
    return {
        "document_id": document_id,
        "filename": document["filename"],
        "file_type": document["file_type"],
        "file_size": document["file_size"],
        "text_length": document["text_length"],
        "uploaded_at": document["uploaded_at"],
        "text_preview": document["extracted_text"][:500] + "..." if len(document["extracted_text"]) > 500 else document["extracted_text"]
    }


@router.delete("/{document_id}")
async def delete_document_endpoint(document_id: str):
    """
    Delete an uploaded document and its associated files.
    Authentication removed for hackathon demo.
    """
    deleted = delete_document(document_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    return {"message": "Document deleted successfully"}

