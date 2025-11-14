from fastapi import APIRouter, HTTPException, status
from schemas.chatbot import ChatRequest, ChatResponse
from services.chatbot_service import get_chat_response

router = APIRouter(prefix="/chatbot", tags=["chatbot"])


@router.post("/chat", response_model=ChatResponse, status_code=200)
async def chat(request: ChatRequest):
    """
    Chat with the AI assistant.
    AUTHENTICATION REMOVED FOR HACKATHON DEMO.
    """
    try:
        # Convert Pydantic models to dicts for the service
        history = []
        if request.conversation_history:
            for msg in request.conversation_history:
                history.append({
                    "role": msg.role,
                    "content": msg.content
                })
        
        result = await get_chat_response(
            message=request.message,
            conversation_history=history
        )
        
        # Convert back to Pydantic models
        conversation_history = []
        for msg in result["conversation_history"]:
            conversation_history.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        
        return {
            "response": result["response"],
            "conversation_history": conversation_history
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chat request: {str(e)}"
        )

