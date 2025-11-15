import os
import requests
from typing import List, Dict
from openai import OpenAI
from schemas.chatbot import ChatMessage
from core.config import settings

# System prompt for the chatbot focused on dyslexia and ADHD support
SYSTEM_PROMPT = """You are a helpful AI assistant specialized in supporting people with dyslexia and ADHD. 
Your role is to:
- Provide clear, concise, and easy-to-understand explanations
- Offer study strategies and learning tips for neurodivergent learners
- Help with reading comprehension and text simplification
- Suggest tools and techniques for better focus and organization
- Be patient, encouraging, and supportive
- Break down complex concepts into simpler parts
- Use bullet points and short sentences when helpful

Always be empathetic and understanding of the challenges faced by people with dyslexia and ADHD."""

async def get_chat_response(message: str, conversation_history: List[Dict] = None) -> Dict:
    """
    Get a response from the AI chatbot.
    """
    try:
        # Prepare messages for OpenAI
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        # Add conversation history if provided
        if conversation_history:
            for msg in conversation_history:
                # Handle both dict and object formats
                if isinstance(msg, dict):
                    messages.append({
                        "role": msg.get("role", "user"),
                        "content": msg.get("content", "")
                    })
                else:
                    messages.append({
                        "role": getattr(msg, "role", "user"),
                        "content": getattr(msg, "content", "")
                    })
        
        # Add current user message
        messages.append({"role": "user", "content": message})
        
        # Try OpenAI first if API key is available
        if settings.OPENAI_API_KEY:
            try:
                client = OpenAI(api_key=settings.OPENAI_API_KEY)
                
                response = client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=500
                )
                
                assistant_message = response.choices[0].message.content.strip()
                
                # Update conversation history
                updated_history = (conversation_history or []).copy()
                updated_history.append({"role": "user", "content": message})
                updated_history.append({"role": "assistant", "content": assistant_message})
                
                return {
                    "response": assistant_message,
                    "conversation_history": updated_history
                }
            except Exception as e:
                print(f"Error with OpenAI chat: {str(e)}")
                # Fall back to rule-based
                pass
        
        # Fallback: Use rule-based responses for dyslexia/ADHD support
        user_message_lower = message.lower()
        
        # Generate contextual response based on keywords
        if any(word in user_message_lower for word in ["reading", "read", "text", "words"]):
            assistant_message = """Here are some helpful reading strategies for dyslexia and ADHD:

• Use a ruler or bookmark to guide your eyes while reading
• Break text into smaller chunks
• Take breaks every 10-15 minutes
• Use text-to-speech tools to listen while reading
• Highlight or underline key points
• Read in a quiet, distraction-free environment
• Try different fonts (Comic Sans, OpenDyslexic, or Arial)
• Increase text spacing and size

Would you like more specific tips for any of these strategies?"""
        
        elif any(word in user_message_lower for word in ["focus", "concentrate", "attention", "distracted"]):
            assistant_message = """Here are focus strategies for ADHD:

• Use the Pomodoro Technique (25 min work, 5 min break)
• Remove distractions (phone, notifications)
• Create a dedicated study space
• Use noise-cancelling headphones or white noise
• Break tasks into smaller steps
• Use timers and reminders
• Exercise before studying to improve focus
• Try fidget tools if they help you concentrate

What specific distraction are you struggling with?"""
        
        elif any(word in user_message_lower for word in ["study", "learn", "homework", "assignment"]):
            assistant_message = """Effective study strategies for dyslexia and ADHD:

• Use visual aids and mind maps
• Record lectures and listen back
• Study in short sessions (20-30 minutes)
• Use color coding for organization
• Create flashcards for key concepts
• Teach the material to someone else
• Use mnemonic devices
• Review material multiple times in different ways

What subject are you studying? I can give more specific advice."""
        
        elif any(word in user_message_lower for word in ["help", "support", "struggling", "difficult"]):
            assistant_message = """I'm here to help! Here are some resources:

• Use text simplification tools (like on this platform)
• Try audio narration for documents
• Use highlight features to mark important information
• Adjust text spacing and fonts for better readability
• Take advantage of color themes that work for you
• Break down complex tasks into smaller steps

What specific challenge can I help you with today?"""
        
        else:
            # General helpful response
            assistant_message = """I'm your AI assistant focused on supporting people with dyslexia and ADHD. 

I can help with:
• Reading strategies and tips
• Focus and concentration techniques
• Study methods and organization
• Text simplification and accessibility
• General support and encouragement

What would you like help with today?"""
        
        # Update conversation history
        updated_history = (conversation_history or []).copy()
        updated_history.append({"role": "user", "content": message})
        updated_history.append({"role": "assistant", "content": assistant_message})
        
        return {
            "response": assistant_message,
            "conversation_history": updated_history
        }
        
    except Exception as e:
        # Fallback response if API fails
        error_msg = str(e)
        if "api_key" in error_msg.lower() or "openai" in error_msg.lower():
            return {
                "response": "I apologize, but the AI service is not properly configured. Please check the OpenAI API key in the backend configuration.",
                "conversation_history": conversation_history or []
            }
        return {
            "response": f"I apologize, but I'm having trouble processing your request right now. Please try again later.",
            "conversation_history": conversation_history or []
        }

