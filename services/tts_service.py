import os
import uuid
from pathlib import Path
from typing import Optional
from fastapi import HTTPException, status
from gtts import gTTS
import tempfile
from datetime import datetime

# Create a directory for storing TTS audio files - use absolute path
AUDIO_DIR = Path(__file__).parent.parent / "static" / "audio"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

# Clean up old files (older than 1 hour) - simple cleanup strategy
def cleanup_old_files():
    """Remove audio files older than 1 hour"""
    try:
        current_time = datetime.now().timestamp()
        for file_path in AUDIO_DIR.glob("*.mp3"):
            if current_time - file_path.stat().st_mtime > 3600:  # 1 hour
                file_path.unlink()
    except Exception:
        pass  # Silently fail on cleanup errors

async def generate_speech(
    text: str,
    language: str = "en",
    slow: bool = False,
    voice_type: Optional[str] = None
) -> dict:
    """
    Generate speech from text using gTTS
    
    Args:
        text: Text to convert to speech
        language: Language code (e.g., 'en', 'es', 'fr')
        slow: Whether to speak slowly
        voice_type: Voice type preference (currently not used with gTTS)
    
    Returns:
        Dictionary with audio_url, text, language, and duration_seconds
    """
    try:
        # Clean up old files
        cleanup_old_files()
        
        # Generate unique filename
        filename = f"{uuid.uuid4().hex}.mp3"
        filepath = AUDIO_DIR / filename
        
        # Generate speech using gTTS
        tts = gTTS(text=text, lang=language, slow=slow)
        tts.save(str(filepath))
        
        # Get file size to estimate duration (rough estimate: ~16KB per second for MP3)
        file_size = filepath.stat().st_size
        estimated_duration = file_size / 16000  # Rough estimate
        
        # Return the URL path (relative to static files)
        audio_url = f"/static/audio/{filename}"
        
        return {
            "audio_url": audio_url,
            "text": text,
            "language": language,
            "duration_seconds": round(estimated_duration, 2)
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid language code or text: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate speech: {str(e)}"
        )

async def delete_audio_file(filename: str) -> bool:
    """
    Delete an audio file
    
    Args:
        filename: Name of the file to delete
    
    Returns:
        True if deleted, False otherwise
    """
    try:
        filepath = AUDIO_DIR / filename
        if filepath.exists():
            filepath.unlink()
            return True
        return False
    except Exception:
        return False

