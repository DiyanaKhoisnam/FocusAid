# FocusAid Setup Guide

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

**Get your OpenAI API key:**
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Create a new API key
4. Copy it to your `.env` file

### 3. Start the Backend Server

```bash
cd backend
python main.py
```

Or using uvicorn directly:

```bash
cd backend
uvicorn main:app --reload --host localhost --port 8000
```

The API will be available at: `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

## Frontend Setup

### 1. Install Dependencies

```bash
cd readable-demo
npm install
```

### 2. Start the Development Server

```bash
cd readable-demo
npm run dev
```

The frontend will be available at: `http://localhost:3000`

## Required API Keys

### OpenAI API Key (Required for AI features)

- **Where to get it:** https://platform.openai.com/api-keys
- **Cost:** Pay-as-you-go (gpt-4o-mini is very affordable)
- **Required for:**
  - Quiz generation
  - Text simplification
  - Document summarization

**Note:** The app will work without an API key but will use rule-based fallbacks (less accurate).

## Features Using LLM

1. **Quiz Generation** - Uses OpenAI to generate intelligent quiz questions
2. **Text Simplification** - Uses OpenAI to simplify complex text for dyslexia/ADHD
3. **Document Summarization** - Uses OpenAI to create concise summaries

## Troubleshooting

### Backend not connecting?
- Make sure the backend is running on port 8000
- Check that CORS is enabled (it should be by default)
- Verify the API URL in frontend is `http://localhost:8000`

### OpenAI API errors?
- Verify your API key is correct in `.env`
- Check you have credits in your OpenAI account
- The app will fall back to rule-based processing if OpenAI fails

### Port already in use?
- Change the port in `backend/main.py` or use a different port
- Update the frontend API URL accordingly

