import re
import random
import json
from datetime import datetime
from typing import List, Dict
from openai import OpenAI
from services.document_service import get_document
from schemas.quiz import QuizQuestion
from core.storage import generate_id
from core.config import settings

def generate_quiz_questions(
    text: str,
    question_types: Dict[str, bool],
    num_questions: int = 5,
    difficulty: str = "medium"
) -> List[QuizQuestion]:
    """
    Generate quiz questions from document text using OpenAI LLM
    """
    questions = []
    
    # Use OpenAI if API key is available
    if settings.OPENAI_API_KEY:
        try:
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            
            # Build question type list
            q_types = []
            if question_types.get("mcq", False):
                q_types.append("multiple choice")
            if question_types.get("true_false", False):
                q_types.append("true/false")
            if question_types.get("short_answer", False):
                q_types.append("short answer")
            
            if not q_types:
                q_types = ["multiple choice"]  # Default
            
            question_types_str = ", ".join(q_types)
            
            # Truncate text if too long (keep first 8000 chars for context)
            text_for_quiz = text[:8000] if len(text) > 8000 else text
            
            prompt = f"""Generate {num_questions} quiz questions from the following text. 
Create questions of these types: {question_types_str}.
Difficulty level: {difficulty}.

Text:
{text_for_quiz}

Generate questions in JSON format with this structure:
{{
  "questions": [
    {{
      "question": "question text here",
      "question_type": "mcq" or "true_false" or "short_answer",
      "options": ["option1", "option2", "option3", "option4"] (only for mcq),
      "correct_answer": "correct answer" (for mcq: "A", "B", "C", or "D"; for true_false: "True" or "False"; for short_answer: the answer text),
      "explanation": "brief explanation"
    }}
  ]
}}

Make sure questions test understanding of key concepts from the text. For multiple choice, provide 4 options and indicate correct answer as A, B, C, or D."""

            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are an expert quiz generator. Generate educational quiz questions in JSON format."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content.strip()
            
            # Parse JSON response
            # Sometimes the response includes markdown code blocks
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            quiz_data = json.loads(content)
            
            # Convert to QuizQuestion objects
            for q_data in quiz_data.get("questions", [])[:num_questions]:
                # Handle correct answer for MCQ
                correct_answer = q_data.get("correct_answer", "")
                if q_data.get("question_type") == "mcq" and correct_answer in ["A", "B", "C", "D"]:
                    # Answer is already in correct format
                    pass
                elif q_data.get("question_type") == "mcq" and q_data.get("options"):
                    # Find index of correct answer in options
                    options = q_data.get("options", [])
                    if correct_answer in options:
                        correct_answer = chr(65 + options.index(correct_answer))
                    else:
                        correct_answer = "A"  # Default
                
                questions.append(QuizQuestion(
                    question=q_data.get("question", ""),
                    question_type=q_data.get("question_type", "mcq"),
                    options=q_data.get("options", []),
                    correct_answer=correct_answer,
                    explanation=q_data.get("explanation", "")
                ))
            
            if questions:
                return questions[:num_questions]
        except Exception as e:
            print(f"Error generating quiz with OpenAI: {str(e)}")
            # Fall back to rule-based approach
            pass
    
    # Fallback to rule-based approach if OpenAI fails or not available
    
    # Extract key sentences and concepts
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 30]
    
    # Key concepts and facts (sentences with important keywords or numbers)
    important_keywords = ["important", "key", "main", "primary", "essential", "critical", 
                         "significant", "result", "finding", "conclusion", "definition",
                         "means", "is", "are", "was", "were", "can", "cannot"]
    
    key_sentences = []
    for sentence in sentences:
        score = 0
        # Boost score for important keywords
        for keyword in important_keywords:
            if keyword.lower() in sentence.lower():
                score += 10
        # Boost score for numbers and dates
        if re.search(r'\d+', sentence):
            score += 5
        # Boost score for definitions (contains "is", "means", "refers to")
        if any(word in sentence.lower() for word in ["is", "means", "refers to", "defined as"]):
            score += 15
        
        if score > 5:
            key_sentences.append((score, sentence))
    
    # Sort by importance
    key_sentences.sort(reverse=True, key=lambda x: x[0])
    key_sentences = [s[1] for s in key_sentences[:num_questions * 2]]  # Get more than needed
    
    question_count = 0
    used_sentences = set()
    
    # Generate MCQ questions
    if question_types.get("mcq", False) and question_count < num_questions:
        for sentence in key_sentences:
            if question_count >= num_questions:
                break
            if sentence in used_sentences:
                continue
            
            # Create MCQ from sentence
            # Extract key term or concept
            words = sentence.split()
            if len(words) > 5:
                # Create a question by converting statement to question
                question = sentence
                # Try to make it a question
                if "is" in sentence.lower():
                    question = sentence.replace(" is ", " is: ").replace("Is ", "What is ")
                elif "are" in sentence.lower():
                    question = sentence.replace(" are ", " are: ").replace("Are ", "What are ")
                elif "means" in sentence.lower():
                    question = sentence.replace(" means ", " means: ").replace("Means ", "What does ")
                else:
                    question = "What is the main point of: " + sentence[:100] + "?"
                
                # Generate options (correct answer + 3 distractors)
                correct_answer = sentence.split()[0] if len(sentence.split()) > 0 else "True"
                
                # Simple distractors (can be improved)
                distractors = [
                    "None of the above",
                    "All of the above",
                    "Not mentioned in the text"
                ]
                
                # Try to extract better options from other sentences
                for other_sentence in key_sentences[:10]:
                    if other_sentence != sentence and len(other_sentence.split()) > 3:
                        first_word = other_sentence.split()[0]
                        if first_word not in distractors and len(distractors) < 3:
                            distractors.append(first_word)
                
                options = [correct_answer] + distractors[:3]
                # Shuffle options (simple shuffle - first is correct)
                import random
                random.shuffle(options)
                correct_index = options.index(correct_answer)
                
                questions.append(QuizQuestion(
                    question=question[:200] + "?",
                    question_type="mcq",
                    options=options,
                    correct_answer=chr(65 + correct_index),  # A, B, C, D
                    explanation=sentence[:150]
                ))
                used_sentences.add(sentence)
                question_count += 1
    
    # Generate True/False questions
    if question_types.get("true_false", False) and question_count < num_questions:
        for sentence in key_sentences:
            if question_count >= num_questions:
                break
            if sentence in used_sentences:
                continue
            
            # Create True/False question
            question = sentence[:150]
            # Make it a statement
            if question.endswith('.'):
                question = question[:-1]
            
            # Determine if it should be True or False (most are True, some can be False)
            is_true = True
            if question_count % 3 == 0:  # Every 3rd question is False
                is_true = False
                # Create a false statement by negating or changing key word
                question = question.replace(" is ", " is not ").replace(" are ", " are not ")
            
            questions.append(QuizQuestion(
                question=question + "?",
                question_type="true_false",
                options=["True", "False"],
                correct_answer="True" if is_true else "False",
                explanation=sentence[:150] if is_true else "This statement is incorrect. " + sentence[:100]
            ))
            used_sentences.add(sentence)
            question_count += 1
    
    # Generate Short Answer questions
    if question_types.get("short_answer", False) and question_count < num_questions:
        for sentence in key_sentences:
            if question_count >= num_questions:
                break
            if sentence in used_sentences:
                continue
            
            # Create short answer question
            words = sentence.split()
            if len(words) > 5:
                # Extract key concept
                question = "Explain briefly: " + sentence[:120] + "?"
                # Extract key answer (first few words or main concept)
                answer = " ".join(words[:8]) if len(words) > 8 else sentence[:100]
                
                questions.append(QuizQuestion(
                    question=question,
                    question_type="short_answer",
                    correct_answer=answer,
                    explanation=sentence[:200]
                ))
                used_sentences.add(sentence)
                question_count += 1
    
    # If we don't have enough questions, create simple ones
    while len(questions) < num_questions:
        remaining_sentences = [s for s in key_sentences if s not in used_sentences]
        if not remaining_sentences:
            break
        
        sentence = remaining_sentences[0]
        question = "What is the main idea of: " + sentence[:100] + "?"
        questions.append(QuizQuestion(
            question=question,
            question_type="short_answer",
            correct_answer=sentence[:100],
            explanation=sentence[:150]
        ))
        used_sentences.add(sentence)
    
    return questions[:num_questions]

async def generate_quiz(
    document_id: str,
    question_types: Dict[str, bool],
    num_questions: int = 5,
    difficulty: str = "medium"
) -> Dict:
    """
    Generate a quiz from a document
    """
    # Get document
    document = get_document(document_id)
    if not document:
        raise Exception("Document not found")
    
    text = document["extracted_text"]
    if not text:
        raise Exception("Document has no extracted text")
    
    # Generate questions
    questions = generate_quiz_questions(
        text=text,
        question_types=question_types,
        num_questions=num_questions,
        difficulty=difficulty
    )
    
    if not questions:
        raise Exception("Could not generate questions from document")
    
    quiz_id = generate_id()
    
    return {
        "document_id": document_id,
        "quiz_id": quiz_id,
        "questions": [q.dict() for q in questions],
        "total_questions": len(questions),
        "created_at": datetime.utcnow()
    }

