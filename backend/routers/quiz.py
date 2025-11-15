from fastapi import APIRouter, HTTPException, status
from schemas.quiz import QuizGenerationRequest, QuizGenerationResponse
from services.quiz_service import generate_quiz

router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.post("/generate", response_model=QuizGenerationResponse, status_code=200)
async def generate_quiz_endpoint(request: QuizGenerationRequest):
    """
    Generate quiz questions from an uploaded document.
    Authentication removed for hackathon demo.
    """
    try:
        # Check if at least one question type is selected
        if not any(request.question_types.values()):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please select at least one question type"
            )
        
        result = await generate_quiz(
            document_id=request.document_id,
            question_types=request.question_types,
            num_questions=request.num_questions,
            difficulty=request.difficulty
        )
        
        return QuizGenerationResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

