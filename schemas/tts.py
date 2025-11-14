from pydantic import BaseModel, Field
from typing import Optional, Literal

class TTSRequest(BaseModel):
    """Request model for text-to-speech conversion"""
    text: str = Field(..., min_length=1, max_length=5000, description="Text to convert to speech")
    language: str = Field(default="en", description="Language code (e.g., 'en', 'es', 'fr')")
    slow: bool = Field(default=False, description="Whether to speak slowly")
    voice_type: Optional[Literal["male", "female"]] = Field(default=None, description="Voice type preference (not all TTS engines support this)")

class TTSResponse(BaseModel):
    """Response model for text-to-speech conversion"""
    audio_url: str = Field(..., description="URL to access the generated audio file")
    text: str = Field(..., description="The text that was converted")
    language: str = Field(..., description="Language used for conversion")
    duration_seconds: Optional[float] = Field(default=None, description="Duration of the audio in seconds")

