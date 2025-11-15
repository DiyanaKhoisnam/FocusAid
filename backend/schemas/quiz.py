from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class QuizQuestion(BaseModel):
    question: str
    question_type: str  # "mcq", "true_false", "short_answer"
    options: Optional[List[str]] = None  # For MCQ
    correct_answer: str
    explanation: Optional[str] = None

class QuizGenerationRequest(BaseModel):
    document_id: str
    question_types: Dict[str, bool] = Field(..., description="Question types: mcq, true_false, short_answer")
    num_questions: int = Field(default=5, ge=1, le=20, description="Number of questions to generate (1-20)")
    difficulty: Optional[str] = Field(default="medium", description="Difficulty level: easy, medium, hard")

class QuizGenerationResponse(BaseModel):
    document_id: str
    quiz_id: str
    questions: List[QuizQuestion]
    total_questions: int
    created_at: datetime

