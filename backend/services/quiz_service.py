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
    Generate quiz questions from document text using OpenAI LLM or rule-based approach
    """
    questions = []
    
    if not text or len(text.strip()) < 50:
        raise ValueError("Document text is too short to generate quiz questions")
    
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
            
            prompt = f"""You are an expert educational quiz generator. Generate {num_questions} high-quality quiz questions from the following text.

Question types to create: {question_types_str}
Difficulty level: {difficulty}

Text content:
{text_for_quiz}

IMPORTANT INSTRUCTIONS:
1. Generate questions that test understanding of key concepts, facts, and main ideas from the text
2. Questions should be clear, concise, and directly related to the content
3. For multiple choice questions:
   - Provide exactly 4 options (A, B, C, D)
   - Make distractors plausible but clearly incorrect
   - Indicate correct answer as "A", "B", "C", or "D" (the letter only)
4. For true/false questions:
   - Create statements that are clearly true or false based on the text
   - Use "True" or "False" as the correct_answer
5. For short answer questions:
   - Ask questions that require brief explanations or key terms
   - Provide a concise correct answer (1-2 sentences max)
6. Include brief explanations that help learners understand why the answer is correct

Generate questions in JSON format with this exact structure:
{{
  "questions": [
    {{
      "question": "Your question text here?",
      "question_type": "mcq",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correct_answer": "A",
      "explanation": "Brief explanation of why this is correct"
    }},
    {{
      "question": "Your true/false statement here.",
      "question_type": "true_false",
      "options": ["True", "False"],
      "correct_answer": "True",
      "explanation": "Brief explanation"
    }},
    {{
      "question": "Your short answer question here?",
      "question_type": "short_answer",
      "correct_answer": "The correct answer text",
      "explanation": "Brief explanation"
    }}
  ]
}}

Return ONLY valid JSON, no additional text or markdown formatting."""

            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are an expert educational quiz generator. Always respond with valid JSON only, no markdown or additional text."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=3000,
                response_format={"type": "json_object"} if settings.OPENAI_MODEL.startswith("gpt-4") else None
            )
            
            content = response.choices[0].message.content.strip()
            
            # Parse JSON response
            # Sometimes the response includes markdown code blocks
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            # Try to extract JSON if wrapped in other text
            try:
                quiz_data = json.loads(content)
            except json.JSONDecodeError:
                # Try to find JSON object in the response
                json_match = re.search(r'\{.*"questions".*\}', content, re.DOTALL)
                if json_match:
                    quiz_data = json.loads(json_match.group())
                else:
                    print(f"Failed to parse JSON. Content: {content[:500]}")
                    raise ValueError("Could not parse JSON from OpenAI response")
            
            # Convert to QuizQuestion objects
            questions_list = quiz_data.get("questions", [])
            if not questions_list:
                # Try alternative structure
                if isinstance(quiz_data, list):
                    questions_list = quiz_data
                else:
                    raise ValueError("No questions found in OpenAI response")
            
            for q_data in questions_list[:num_questions]:
                # Handle correct answer for MCQ
                correct_answer = str(q_data.get("correct_answer", "")).strip()
                question_type = q_data.get("question_type", "mcq")
                
                if question_type == "mcq":
                    # Ensure correct_answer is A, B, C, or D
                    if correct_answer.upper() in ["A", "B", "C", "D"]:
                        correct_answer = correct_answer.upper()
                    elif q_data.get("options"):
                        # Find index of correct answer in options
                        options = q_data.get("options", [])
                        if correct_answer in options:
                            correct_answer = chr(65 + options.index(correct_answer))
                        elif len(options) > 0:
                            correct_answer = "A"  # Default to first option
                    else:
                        correct_answer = "A"  # Default
                elif question_type == "true_false":
                    # Normalize to True or False
                    if correct_answer.lower() in ["true", "t"]:
                        correct_answer = "True"
                    elif correct_answer.lower() in ["false", "f"]:
                        correct_answer = "False"
                    else:
                        correct_answer = "True"  # Default
                
                # Validate question data
                question_text = q_data.get("question", "").strip()
                if not question_text or len(question_text) < 10:
                    continue  # Skip invalid questions
                
                # Ensure options are set for MCQ and True/False
                options = None
                if question_type == "mcq":
                    options = q_data.get("options", [])
                    if not options or len(options) < 4:
                        # Generate default options if missing
                        options = ["Option A", "Option B", "Option C", "Option D"]
                elif question_type == "true_false":
                    options = ["True", "False"]
                
                questions.append(QuizQuestion(
                    question=question_text,
                    question_type=question_type,
                    options=options,
                    correct_answer=correct_answer,
                    explanation=q_data.get("explanation", "").strip() if q_data.get("explanation") else f"The correct answer is {correct_answer}."
                ))
            
            if questions and len(questions) > 0:
                print(f"✅ Successfully generated {len(questions)} questions using OpenAI")
                return questions[:num_questions]
        except Exception as e:
            print(f"❌ Error generating quiz with OpenAI: {str(e)}")
            import traceback
            traceback.print_exc()
            # Fall back to rule-based approach
            pass
    
    # Fallback to rule-based approach if OpenAI fails or not available
    print("📝 Using rule-based quiz generation (OpenAI not available or failed)")
    
    # Extract key sentences and concepts
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
    
    # If not enough sentences, try splitting by paragraphs
    if len(sentences) < 3:
        paragraphs = text.split('\n\n')
        for para in paragraphs:
            para_sentences = re.split(r'[.!?]+', para)
            sentences.extend([s.strip() for s in para_sentences if len(s.strip()) > 20])
    
    if len(sentences) < 2:
        # Last resort: split by newlines
        lines = text.split('\n')
        sentences = [s.strip() for s in lines if len(s.strip()) > 20]
    
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
                
                # Extract key concept or term from sentence
                words = sentence.split()
                # Get first meaningful word (skip articles)
                articles = {"the", "a", "an", "this", "that", "these", "those"}
                key_term = None
                for word in words[:5]:
                    if word.lower() not in articles and len(word) > 3:
                        key_term = word.strip('.,!?;:')
                        break
                
                if not key_term:
                    key_term = words[0].strip('.,!?;:') if words else "concept"
                
                # Generate better options
                distractors = []
                
                # Extract distractors from other sentences
                for other_sentence in key_sentences[:15]:
                    if other_sentence != sentence:
                        other_words = other_sentence.split()
                        for word in other_words[:3]:
                            word_clean = word.strip('.,!?;:').lower()
                            if (len(word_clean) > 3 and 
                                word_clean not in articles and 
                                word_clean != key_term.lower() and
                                word_clean not in [d.lower() for d in distractors] and
                                len(distractors) < 3):
                                distractors.append(word.strip('.,!?;:'))
                                break
                
                # Fill remaining distractors
                while len(distractors) < 3:
                    distractors.append(f"Option {len(distractors) + 2}")
                
                options = [key_term] + distractors[:3]
                # Shuffle options
                random.shuffle(options)
                correct_index = options.index(key_term)
                
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
            # Use any remaining sentences from original list
            remaining_sentences = [s for s in sentences if s not in used_sentences and len(s) > 20]
        
        if not remaining_sentences:
            break
        
        sentence = remaining_sentences[0]
        
        # Determine question type based on what's needed
        if not question_types.get("short_answer", False) or len([q for q in questions if q.question_type == "short_answer"]) >= num_questions // 3:
            # Create MCQ as fallback
            words = sentence.split()
            if len(words) > 3:
                question = "What is the main point about: " + " ".join(words[:5]) + "?"
                key_term = words[0].strip('.,!?;:') if words else "concept"
                options = [key_term, "Different concept", "Opposite idea", "Unrelated topic"]
                random.shuffle(options)
                correct_index = options.index(key_term)
                
                questions.append(QuizQuestion(
                    question=question,
                    question_type="mcq",
                    options=options,
                    correct_answer=chr(65 + correct_index),
                    explanation=sentence[:150]
                ))
        else:
            question = "Explain: " + sentence[:100] + "?"
            questions.append(QuizQuestion(
                question=question,
                question_type="short_answer",
                correct_answer=sentence[:100],
                explanation=sentence[:150]
            ))
        used_sentences.add(sentence)
    
    if len(questions) == 0:
        raise ValueError("Could not generate any questions from the document text. The text may be too short or unclear.")
    
    print(f"✅ Generated {len(questions)} questions using rule-based approach")
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
    try:
        print(f"🎯 Generating quiz for document {document_id}")
        print(f"   Question types: {question_types}")
        print(f"   Number of questions: {num_questions}")
        
        # Get document
        document = get_document(document_id)
        if not document:
            raise Exception(f"Document {document_id} not found")
        
        text = document.get("extracted_text") or document.get("text", "")
        if not text or len(text.strip()) < 50:
            raise Exception("Document has no extracted text or text is too short (minimum 50 characters required)")
        
        print(f"   Document text length: {len(text)} characters")
        
        # Generate questions
        questions = generate_quiz_questions(
            text=text,
            question_types=question_types,
            num_questions=num_questions,
            difficulty=difficulty
        )
        
        if not questions or len(questions) == 0:
            raise Exception("Could not generate questions from document. Please try with a longer document.")
        
        quiz_id = generate_id()
        
        result = {
            "document_id": document_id,
            "quiz_id": quiz_id,
            "questions": [q.dict() for q in questions],
            "total_questions": len(questions),
            "created_at": datetime.utcnow()
        }
        
        print(f"✅ Quiz generated successfully: {len(questions)} questions")
        return result
        
    except Exception as e:
        print(f"❌ Error in generate_quiz: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

