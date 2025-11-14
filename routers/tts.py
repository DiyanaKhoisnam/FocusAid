from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from pathlib import Path
import os

from schemas.tts import TTSRequest, TTSResponse
from services.tts_service import generate_speech, delete_audio_file
from core.dependencies import get_current_user
from schemas.user import UserResponse

router = APIRouter(prefix="/tts", tags=["text-to-speech"])

# Directory for audio files - use absolute path
AUDIO_DIR = Path(__file__).parent.parent / "static" / "audio"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/generate", response_model=TTSResponse, status_code=200)
async def create_speech(request: TTSRequest):
    """
    Convert text to speech.
    AUTHENTICATION REMOVED FOR HACKATHON DEMO.
    """
    result = await generate_speech(
        text=request.text,
        language=request.language,
        slow=request.slow,
        voice_type=request.voice_type
    )

    # Extract filename from audio_url (e.g., "/static/audio/abc123.mp3" -> "abc123.mp3")
    audio_path = result["audio_url"]
    filename = audio_path.split("/")[-1]
    
    # Construct full audio URL using the /tts/audio endpoint
    audio_url = f"http://127.0.0.1:8000/tts/audio/{filename}"

    # Return response matching TTSResponse schema
    return {
        "audio_url": audio_url,
        "text": result["text"],
        "language": result["language"],
        "duration_seconds": result.get("duration_seconds")
    }


@router.get("/audio/{filename}")
async def get_audio_file(filename: str):
    """
    Serve audio files.
    """
    filepath = AUDIO_DIR / filename
    
    # Check if file exists
    if not filepath.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audio file not found: {filename}. Path checked: {filepath}"
        )

    return FileResponse(
        path=filepath,
        media_type="audio/mpeg",
        filename=filename
    )


@router.delete("/audio/{filename}")
async def delete_audio(
    filename: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Delete an audio file.
    STILL REQUIRES AUTHENTICATION.
    """
    deleted = await delete_audio_file(filename)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audio file not found"
        )
    return {"message": "Audio file deleted successfully"}



