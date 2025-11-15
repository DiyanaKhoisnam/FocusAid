import os
import re
import requests
from typing import Dict, Optional
from openai import OpenAI
from services.document_service import get_document
from services.tts_service import generate_speech
from core.storage import documents_db
from core.config import settings

# Hugging Face API endpoint (free, no API key needed for public models)
HUGGINGFACE_API = "https://api-inference.huggingface.co/models"

async def simplify_text(text: str) -> str:
    """Simplify complex text for better readability using OpenAI"""
    try:
        # Use OpenAI if API key is available
        if settings.OPENAI_API_KEY:
            try:
                client = OpenAI(api_key=settings.OPENAI_API_KEY)
                
                # Truncate if too long (keep first 6000 chars)
                text_to_simplify = text[:6000] if len(text) > 6000 else text
                
                response = client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": "You are a text simplification expert. Simplify the given text to make it easier to read for people with dyslexia and ADHD. Use simpler words, shorter sentences, and clearer structure. Maintain the original meaning."},
                        {"role": "user", "content": f"Simplify this text:\n\n{text_to_simplify}"}
                    ],
                    temperature=0.3,
                    max_tokens=2000
                )
                
                simplified = response.choices[0].message.content.strip()
                return simplified
            except Exception as e:
                print(f"Error simplifying with OpenAI: {str(e)}")
                # Fall back to rule-based
                pass
        
        # Fallback to rule-based simplification
        
        # Complex word replacements
        replacements = {
            "utilize": "use",
            "approximately": "about",
            "facilitate": "help",
            "demonstrate": "show",
            "indicate": "show",
            "obtain": "get",
            "acquire": "get",
            "comprehend": "understand",
            "perceive": "see",
            "commence": "start",
            "terminate": "end",
            "sufficient": "enough",
            "numerous": "many",
            "substantial": "large",
            "minimal": "small",
            "significant": "important",
            "essential": "important",
            "fundamental": "basic",
            "complex": "hard",
            "simplify": "make simple",
            "clarify": "explain",
            "elaborate": "explain more",
        }
        
        simplified = text
        for complex_word, simple_word in replacements.items():
            simplified = re.sub(rf'\b{complex_word}\b', simple_word, simplified, flags=re.IGNORECASE)
        
        # Break long sentences into shorter ones
        sentences = re.split(r'([.!?]+)', simplified)
        result_sentences = []
        for i in range(0, len(sentences) - 1, 2):
            sentence = sentences[i].strip()
            punctuation = sentences[i + 1] if i + 1 < len(sentences) else ""
            
            # If sentence is too long, try to break it at commas
            if len(sentence) > 100:
                parts = sentence.split(',')
                if len(parts) > 1:
                    # Break into smaller sentences
                    for j, part in enumerate(parts):
                        part = part.strip()
                        if part:
                            if j == 0:
                                result_sentences.append(part + punctuation)
                            else:
                                result_sentences.append(part.capitalize() + punctuation)
                else:
                    result_sentences.append(sentence + punctuation)
            else:
                result_sentences.append(sentence + punctuation)
        
        simplified = ' '.join(result_sentences)
        
        # Break long paragraphs
        paragraphs = simplified.split('\n\n')
        result_paragraphs = []
        for para in paragraphs:
            if len(para) > 500:
                # Split into smaller paragraphs
                sentences_in_para = re.split(r'([.!?]+)', para)
                current_para = ""
                for i in range(0, len(sentences_in_para) - 1, 2):
                    sentence = sentences_in_para[i].strip()
                    punctuation = sentences_in_para[i + 1] if i + 1 < len(sentences_in_para) else ""
                    if len(current_para + sentence) > 300:
                        if current_para:
                            result_paragraphs.append(current_para.strip())
                        current_para = sentence + punctuation + " "
                    else:
                        current_para += sentence + punctuation + " "
                if current_para:
                    result_paragraphs.append(current_para.strip())
            else:
                result_paragraphs.append(para)
        
        return '\n\n'.join(result_paragraphs)
        
    except Exception as e:
        print(f"Error in simplify_text: {str(e)}")
        # Fallback: basic simplification
        simplified = text.replace("utilize", "use").replace("approximately", "about").replace("facilitate", "help")
        simplified = simplified.replace("demonstrate", "show").replace("indicate", "show").replace("obtain", "get")
        return simplified

async def highlight_keywords(text: str) -> str:
    """Highlight important keywords in text"""
    try:
        # Use rule-based keyword highlighting (no API needed)
        # Important words and phrases to highlight
        important_words = [
            "important", "key", "main", "primary", "essential", "critical", 
            "significant", "note", "remember", "focus", "attention", "warning",
            "caution", "summary", "conclusion", "result", "finding", "discovery",
            "example", "instance", "specifically", "particularly", "especially",
            "must", "should", "need", "require", "necessary", "vital", "crucial"
        ]
        
        # Also highlight numbers and dates (often important)
        highlighted = text
        
        # Highlight important words
        for word in important_words:
            highlighted = re.sub(rf'\b{re.escape(word)}\b', f'<mark>{word}</mark>', highlighted, flags=re.IGNORECASE)
        
        # Highlight numbers (years, percentages, quantities)
        highlighted = re.sub(r'\b\d{4}\b', r'<mark>\g<0></mark>', highlighted)  # Years
        highlighted = re.sub(r'\b\d+%', r'<mark>\g<0></mark>', highlighted)  # Percentages
        highlighted = re.sub(r'\$\d+', r'<mark>\g<0></mark>', highlighted)  # Money
        
        # Highlight common important phrases
        important_phrases = [
            r"in conclusion",
            r"to summarize",
            r"it is important",
            r"keep in mind",
            r"take note",
            r"remember that",
            r"the main point",
            r"key finding",
        ]
        
        for phrase in important_phrases:
            highlighted = re.sub(phrase, f'<mark>\\g<0></mark>', highlighted, flags=re.IGNORECASE)
        
        return highlighted
        
    except Exception as e:
        print(f"Error in highlight_keywords: {str(e)}")
        # Fallback: highlight common important words
        important_words = ["important", "key", "main", "primary", "essential", "critical", "significant", "note", "remember", "focus"]
        highlighted = text
        for word in important_words:
            highlighted = re.sub(rf'\b{word}\b', f'<mark>{word}</mark>', highlighted, flags=re.IGNORECASE)
        return highlighted

def apply_accessibility_settings(text: str, settings: Dict[str, str]) -> str:
    """Apply accessibility settings to text"""
    # Note: Letter spacing is handled on frontend via CSS
    # Word spacing was changed to letter spacing - no backend processing needed
    # Font is handled on frontend via CSS
    # Color theme is handled on frontend via CSS
    
    # Return text as-is since all formatting is done via CSS on frontend
    return text

async def process_document(
    document_id: str,
    options: Dict[str, bool],
    accessibility_settings: Optional[Dict[str, str]] = None
) -> Dict:
    """Process document with multiple options"""
    try:
        print(f"Processing document {document_id} with options: {options}")
        
        # Get document
        document = get_document(document_id)
        if not document:
            raise Exception(f"Document not found: {document_id}")
        
        text = document["extracted_text"]
        if not text:
            raise Exception("Document has no extracted text")
        
        print(f"Document text length: {len(text)} characters")
        
        results = {
            "document_id": document_id,
            "processed_text": None,
            "summary": None,
            "highlighted_text": None,
            "audio_url": None,
            "simplified_text": None,
            "accessibility_applied": accessibility_settings or {}
        }
        
        # Generate summary if requested
        if options.get("summary", False):
            print("Generating summary...")
            try:
                from services.document_service import generate_summary
                summary_result = await generate_summary(document_id, max_length=200)
                results["summary"] = summary_result["summary"]
                print("Summary generated successfully")
            except Exception as e:
                print(f"Error generating summary: {str(e)}")
                import traceback
                print(traceback.format_exc())
                # Fallback: create a simple summary
                sentences = [s.strip() for s in text.split('.') if s.strip()][:5]
                if sentences:
                    results["summary"] = '• ' + '\n• '.join(sentences) + '.'
                else:
                    results["summary"] = "• " + text[:200] + "..."
        
        # Highlight keywords if requested
        if options.get("highlight", False):
            print("Highlighting keywords...")
            try:
                results["highlighted_text"] = await highlight_keywords(text)
                print("Keywords highlighted successfully")
            except Exception as e:
                print(f"Error highlighting keywords: {str(e)}")
                # Fallback highlighting
                important_words = ["important", "key", "main", "primary", "essential"]
                highlighted = text
                for word in important_words:
                    highlighted = re.sub(rf'\b{word}\b', f'<mark>{word}</mark>', highlighted, flags=re.IGNORECASE)
                results["highlighted_text"] = highlighted
        
        # Generate audio if requested
        if options.get("textToAudio", False):
            print("Generating audio...")
            try:
                # Use first 5000 characters for audio (to avoid long processing)
                audio_text = text[:5000] if len(text) > 5000 else text
                if len(text) > 5000:
                    audio_text += "... [Text truncated for audio]"
                
                tts_result = await generate_speech(
                    text=audio_text,
                    language="en",
                    slow=False,
                    voice_type=None
                )
                results["audio_url"] = tts_result["audio_url"]
                print("Audio generated successfully")
            except Exception as e:
                results["audio_url"] = None
                print(f"Error generating audio: {str(e)}")
        
        # Simplify text if requested
        if options.get("simplify", False):
            print("Simplifying text...")
            try:
                results["simplified_text"] = await simplify_text(text)
                print("Text simplified successfully")
            except Exception as e:
                print(f"Error simplifying text: {str(e)}")
                # Fallback: basic simplification
                simplified = text.replace("utilize", "use").replace("approximately", "about")
                results["simplified_text"] = simplified
        
        # Apply accessibility settings
        print("Applying accessibility settings...")
        # Determine which text to apply settings to
        text_to_process = results.get("simplified_text") or results.get("highlighted_text") or text
        
        if accessibility_settings:
            results["processed_text"] = apply_accessibility_settings(text_to_process, accessibility_settings)
        else:
            results["processed_text"] = text_to_process
        
        # Ensure processed_text is never None
        if not results["processed_text"]:
            results["processed_text"] = text
        
        print("Processing complete!")
        return results
        
    except Exception as e:
        import traceback
        print(f"Error in process_document: {str(e)}")
        print(traceback.format_exc())
        raise Exception(f"Failed to process document: {str(e)}")

