# FocusAid — Frontend Application

## Quick start
1. Install dependencies:
   ```bash
   cd readable-demo
   npm install
   ```

2. Configure backend URL (optional):
   Create a `.env.local` file in the `readable-demo` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
   If not set, it defaults to `http://localhost:8000`

3. Start the development server:
   ```bash
   npm run dev
   ```
   The app will run on http://localhost:3000

## Backend Integration

The frontend is integrated with the FastAPI backend:
- **Login**: POST `/auth/login` - Authenticates user and returns access token
- **Signup**: POST `/auth/register` - Creates new user account
- **API Base URL**: Configured in `lib/api.js` (defaults to `http://localhost:8000`)

Make sure the backend is running on port 8000 before using authentication features.