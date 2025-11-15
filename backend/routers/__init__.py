from .auth import router as auth_router
from .tts import router as tts_router
from .documents import router as documents_router
from .chatbot import router as chatbot_router
from .quiz import router as quiz_router

__all__ = ["auth_router", "tts_router", "documents_router", "chatbot_router", "quiz_router"]

