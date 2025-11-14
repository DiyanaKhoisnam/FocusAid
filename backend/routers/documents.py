from fastapi import APIRouter, HTTPException, status, UploadFile, File
from typing import Optional

from schemas.document import (
    DocumentUploadResponse, 
    SummaryRequest, 
    SummaryResponse,
    ProcessDocumentRequest,
    ProcessDocumentResponse
)
from services.document_service import (
    upload_document,
    generate_summary,
    get_document,
    delete_document
)
from services.document_processor import process_document

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


@router.post("/process", response_model=ProcessDocumentResponse, status_code=200)
async def process_document_endpoint(request: ProcessDocumentRequest):
    """
    Process a document with multiple options (summary, highlight, text-to-audio, simplify).
    Also applies accessibility settings.
    Authentication removed for hackathon demo.
    """
    try:
        print(f"Received process request: document_id={request.document_id}, options={request.options}")
        print(f"Accessibility settings: {request.accessibility_settings}")
        
        result = await process_document(
            document_id=request.document_id,
            options=request.options,
            accessibility_settings=request.accessibility_settings
        )
        
        print(f"Processing complete, returning result")
        print(f"Result keys: {result.keys()}")
        
        # Ensure all required fields are present
        if not result.get("processed_text"):
            result["processed_text"] = result.get("simplified_text") or result.get("highlighted_text") or ""
        
        return ProcessDocumentResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = str(e)
        print(f"Error in process_document_endpoint: {error_detail}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process document: {error_detail}"
        )


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

