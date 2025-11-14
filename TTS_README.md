# TTS (Text-to-Speech) Backend

This guide explains how to use the TTS backend functionality.

## Setup

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. The TTS service uses gTTS (Google Text-to-Speech) which requires an internet connection to generate audio.

## API Endpoints

### 1. Generate Speech
**POST** `/tts/generate`

Convert text to speech. Requires authentication.

**Request Body:**
```json
{
  "text": "Hello, this is a test message",
  "language": "en",
  "slow": false,
  "voice_type": null
}
```

**Response:**
```json
{
  "audio_url": "/static/audio/abc123def456.mp3",
  "text": "Hello, this is a test message",
  "language": "en",
  "duration_seconds": 2.5
}
```

**Parameters:**
- `text` (required): Text to convert (1-5000 characters)
- `language` (optional): Language code (default: "en")
  - Examples: "en" (English), "es" (Spanish), "fr" (French), "de" (German), etc.
- `slow` (optional): Whether to speak slowly (default: false)
- `voice_type` (optional): Voice type preference (currently not used with gTTS)

### 2. Get Audio File
**GET** `/static/audio/{filename}`

Retrieve the generated audio file. No authentication required.

### 3. Delete Audio File
**DELETE** `/tts/audio/{filename}`

Delete an audio file. Requires authentication.

## Usage Example

1. **Login to get an access token:**
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

2. **Generate speech:**
```bash
curl -X POST "http://localhost:8000/tts/generate" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, welcome to EduNeuro!",
    "language": "en",
    "slow": false
  }'
```

3. **Access the audio file:**
```bash
curl "http://localhost:8000/static/audio/abc123def456.mp3" --output audio.mp3
```

## Language Codes

Common language codes supported by gTTS:
- `en` - English
- `es` - Spanish
- `fr` - French
- `de` - German
- `it` - Italian
- `pt` - Portuguese
- `ru` - Russian
- `ja` - Japanese
- `ko` - Korean
- `zh` - Chinese
- And many more...

## File Management

- Audio files are stored in `static/audio/` directory
- Files are automatically cleaned up after 1 hour
- Each file has a unique UUID-based filename
- Files are served as MP3 format

## Notes

- gTTS requires an internet connection
- There may be rate limits when making many requests
- For production, consider using cloud TTS services (Azure, AWS Polly, Google Cloud TTS) for better quality and reliability
- The current implementation uses gTTS which is free but has limitations

