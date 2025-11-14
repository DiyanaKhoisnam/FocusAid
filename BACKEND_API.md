# FocusAid Backend API Documentation

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set Environment Variables**
   Create a `.env` file in the `backend` directory:
   ```env
   OPENAI_API_KEY=your-openai-api-key-here
   SECRET_KEY=your-secret-key-here
   ```

3. **Run the Server**
   ```bash
   cd backend
   python main.py
   ```
   Or using uvicorn:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Access API Documentation**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## API Endpoints

### 1. Document Upload & Processing

#### Upload Document
- **POST** `/documents/upload`
- **Description**: Upload a PDF or TXT file
- **Request**: `multipart/form-data` with `file` field
- **Response**:
  ```json
  {
    "document_id": "uuid",
    "filename": "example.pdf",
    "file_type": "pdf",
    "file_size": 12345,
    "uploaded_at": "2024-01-01T00:00:00",
    "text_preview": "First 500 characters..."
  }
  ```

#### Process Document
- **POST** `/documents/process`
- **Description**: Process document with multiple options
- **Request Body**:
  ```json
  {
    "document_id": "uuid",
    "options": {
      "summary": true,
      "highlight": true,
      "textToAudio": true,
      "simplify": true
    },
    "accessibility_settings": {
      "spacing": "wide",
      "font": "comic-sans",
      "colorTheme": "high-contrast"
    }
  }
  ```
- **Response**:
  ```json
  {
    "document_id": "uuid",
    "processed_text": "Text with accessibility applied...",
    "summary": "Summary text...",
    "highlighted_text": "Text with <mark>highlights</mark>...",
    "audio_url": "http://localhost:8000/tts/audio/abc123.mp3",
    "simplified_text": "Simplified text...",
    "accessibility_applied": {
      "spacing": "wide",
      "font": "comic-sans",
      "colorTheme": "high-contrast"
    }
  }
  ```

#### Get Document
- **GET** `/documents/{document_id}`
- **Description**: Get document information

#### Delete Document
- **DELETE** `/documents/{document_id}`
- **Description**: Delete a document

### 2. Text-to-Speech

#### Generate Speech
- **POST** `/tts/generate`
- **Request Body**:
  ```json
  {
    "text": "Text to convert to speech",
    "language": "en",
    "slow": false,
    "voice_type": null
  }
  ```
- **Response**:
  ```json
  {
    "audio_url": "http://localhost:8000/tts/audio/abc123.mp3",
    "text": "Text to convert to speech",
    "language": "en",
    "duration_seconds": 5.2
  }
  ```

#### Get Audio File
- **GET** `/tts/audio/{filename}`
- **Description**: Serve audio file

### 3. Chatbot

#### Chat with AI
- **POST** `/chatbot/chat`
- **Request Body**:
  ```json
  {
    "message": "How can I improve my reading?",
    "conversation_history": [
      {
        "role": "user",
        "content": "Hello"
      },
      {
        "role": "assistant",
        "content": "Hi! How can I help you?"
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "response": "AI response text...",
    "conversation_history": [
      {
        "role": "user",
        "content": "Hello"
      },
      {
        "role": "assistant",
        "content": "Hi! How can I help you?"
      },
      {
        "role": "user",
        "content": "How can I improve my reading?"
      },
      {
        "role": "assistant",
        "content": "AI response text..."
      }
    ]
  }
  ```

### 4. Authentication (Optional - for future use)

#### Register
- **POST** `/auth/register`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

#### Login
- **POST** `/auth/login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

## Features

### Document Processing Options

1. **Summary**: Generate AI-powered summary of the document
2. **Highlight**: Identify and highlight important keywords
3. **Text to Audio**: Convert text to speech audio file
4. **Simplify**: Simplify complex language for better readability

### Accessibility Settings

1. **Word Spacing**: 
   - `normal`: Default spacing
   - `wide`: Double spacing
   - `extra-wide`: Triple spacing

2. **Font Style**:
   - `default`: System default
   - `open-dyslexic`: OpenDyslexic font
   - `comic-sans`: Comic Sans MS
   - `arial`: Arial

3. **Color Theme**:
   - `default`: Pastel blue background
   - `high-contrast`: Black and white
   - `sepia`: Warm sepia tones
   - `dark`: Dark mode

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

Error responses follow this format:
```json
{
  "detail": "Error message here"
}
```

## Notes

- All endpoints are currently open (no authentication required) for hackathon demo
- File uploads are stored in `backend/static/documents/`
- Audio files are stored in `backend/static/audio/`
- Documents and summaries are stored in-memory (will be lost on server restart)
- OpenAI API key is required for AI features (summary, simplify, highlight, chatbot)

