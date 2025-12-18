import os
import re
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

try:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set")
    genai.configure(api_key=api_key)
except Exception as e:
    print(f"Failed to configure Gemini API: {e}")
    raise


def clean_json_response(response_text: str) -> str:
    if not response_text:
        return ''

    text = response_text.strip()

    
    text = re.sub(r'```\s*json', '```', text, flags=re.IGNORECASE)
    text = text.replace('```', '').strip()

    
    start = text.find('{')
    if start == -1:
        return text.strip()

    
    depth = 0
    end = None
    for i in range(start, len(text)):
        ch = text[i]
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                end = i
                break

    if end is not None:
        return text[start:end + 1].strip()
    
    return text[start:].strip()


def generate_mindmap_from_text(text_content):
    model = genai.GenerativeModel('gemini-2.5-flash')

    
    prompt = f"""
    Analyze the following text and generate a structured JSON object for a mind map visualization.
    The structure should be lateral (horizontal flow), with the main root having 3-5 major branches (children).
    
    The JSON must follow this structure **exactly**:
    - A single root object with a key named "root".
    - Nodes can optionally have the "summary" and "definition" fields.
    - IMPORTANT: For any node representing a core concept, include an optional property named "definition" which contains a short, single-sentence string explanation of that term. This definition will be visualized as a child node in the UI.
    - Ensure the output is only the raw JSON, without any surrounding text, explanations, or markdown formatting like ```json.

    **JSON Structure Example:**
    {{
        "root": {{
            "topic": "Main Topic",
            "children": [
                {{
                    "topic": "Core Concept",
                    "summary": "o`ptional detailed summary string (e.g., key points from the text).",
                    "definition": "optional short, single-sentence definition string for key terms.",
                    "children": [
                        {{
                            "topic": "Further Detail or Sub-topic",
                            "summary": "another optional summary",
                            "children": []
                        }}
                    ]
                }}
            ]
        }}
    }}
    Important: Return ONLY valid JSON that matches the schema above. Do NOT include any explanation, markdown, or additional text. The output must be a single JSON object and nothing else.

    Text to Analyze:
    ---
    {text_content}
    ---
    """

    try:
        def _attempt(p):
            resp = model.generate_content(p)
            raw = resp.text or ''
            return clean_json_response(raw)

        cleaned = _attempt(prompt)
        try:
            parsed = json.loads(cleaned)
            return json.dumps(parsed, ensure_ascii=False)
        except Exception:
            strict_prompt = (
                prompt
                + "\nIMPORTANT: Return ONLY valid JSON exactly as specified above. No text, no markdown, no explanation. If you cannot produce valid JSON, respond with an object like {\"error\": \"description\"}."
            )
            cleaned2 = _attempt(strict_prompt)
            try:
                parsed2 = json.loads(cleaned2)
                return json.dumps(parsed2, ensure_ascii=False)
            except Exception:
                return json.dumps({"error": "Invalid JSON received from AI"})

    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return '{"error": "Failed to generate mind map due to an API error."}'


def generate_summary_from_text(text_content):
    """Generate a student-friendly summary from text content with markdown formatting"""
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    You are an educational assistant helping students understand complex topics. Create a clear, comprehensive summary of the following text.

    Format your response as a JSON object with this exact structure:
    {{
        "title": "Brief title for the content",
        "summary": "2-3 paragraph overview in simple language with proper markdown formatting. Use **bold** for important terms, *italics* for emphasis, and proper paragraphs.",
        "key_points": [
            "Key point 1 - clear and concise",
            "Key point 2 - clear and concise", 
            "Key point 3 - clear and concise",
            "Key point 4 - clear and concise"
        ],
        "detailed_explanation": "A longer, more detailed explanation broken into multiple paragraphs. Use markdown formatting including:\\n\\n- **Bold** for key concepts\\n- *Italics* for emphasis\\n- Proper paragraph breaks\\n- Bullet points where appropriate\\n\\nThis should be educational and easy to understand.",
        "example": "A simple, relatable example or analogy to help understand the main concept. Use markdown formatting here too.",
        "conclusion": "A brief concluding thought or key takeaway in 1-2 sentences."
    }}

    Important formatting guidelines:
    - Use **bold** (double asterisks) for important terms and concepts
    - Use *italics* (single asterisks) for emphasis
    - Use \\n\\n for paragraph breaks
    - Keep the language simple and engaging for students
    - Avoid jargon, or explain it when necessary
    - Focus on the most important concepts

    Text to summarize:
    ---
    {text_content}
    ---
    
    Return ONLY the JSON object, no additional text or formatting.
    """

    try:
        response = model.generate_content(prompt)
        raw_response = response.text or ''
        cleaned_response = clean_json_response(raw_response)
        
        try:
            parsed_data = json.loads(cleaned_response)
            return parsed_data
        except json.JSONDecodeError:
            return {
                "error": "Failed to parse AI response",
                "title": "Summary Error",
                "summary": "Unable to generate summary at this time.",
                "key_points": ["Please try again with a different document"],
                "detailed_explanation": "There was an error processing your document. Please try again.",
                "example": "Technical error occurred",
                "conclusion": "Please try uploading your document again."
            }
    except Exception as e:
        print(f"Error generating summary: {e}")
        return {
            "error": f"Failed to generate summary: {str(e)}",
            "title": "Error",
            "summary": "Unable to process your document.",
            "key_points": ["Please try again"],
            "detailed_explanation": "A system error occurred while processing your request.",
            "example": "System error",
            "conclusion": "Please try again later."
        }


def generate_quiz_from_text(text_content, num_questions=5):
    """Generate an interactive quiz from text content"""
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    You are an educational assistant creating a quiz for students. Generate {num_questions} multiple-choice questions based on the following text.

    Format your response as a JSON object with this exact structure:
    {{
        "quiz_type": "mcq",
        "questions": [
            {{
                "question": "Question text here?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "answer": "Option B"
            }}
        ]
    }}

    IMPORTANT:
    - Generate exactly {num_questions} questions
    - Each question must have 4 options
    - The "answer" field must be the exact text of the correct option (not an index)
    - Questions should test understanding, not just memorization
    - Keep language clear and appropriate for students

    Text for quiz creation:
    ---
    {text_content}
    ---
    
    Return ONLY the JSON object, no additional text or formatting.
    """

    try:
        response = model.generate_content(prompt)
        raw_response = response.text or ''
        cleaned_response = clean_json_response(raw_response)
        
        try:
            parsed_data = json.loads(cleaned_response)
            # Ensure the format is correct
            if "questions" not in parsed_data:
                parsed_data = {"quiz_type": "mcq", "questions": []}
            if "quiz_type" not in parsed_data:
                parsed_data["quiz_type"] = "mcq"
            return parsed_data
        except json.JSONDecodeError:
            return {
                "quiz_type": "mcq",
                "questions": [
                    {
                        "question": "Please try uploading your document again.",
                        "options": ["Try again", "Upload different file", "Contact support", "Check file format"],
                        "answer": "Try again"
                    }
                ]
            }
    except Exception as e:
        print(f"Error generating quiz: {e}")
        return {
            "quiz_type": "mcq",
            "questions": [
                {
                    "question": "What should you do when encountering this error?",
                    "options": ["Try again", "Contact support", "Check internet", "All of the above"],
                    "answer": "All of the above"
                }
            ]
        }


def generate_infographic_data_from_text(text_content):
    """Generate structured data for a modern Bento Box infographic layout"""
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    Analyze this text for an educational infographic. Act as an instructional designer.
    Break it into a 'Bento Box' grid layout with visual hierarchy and layout metadata.
    
    CRITICAL INSTRUCTION: 
    - You must ONLY use the information present in the "Text to analyze" section below. 
    - Do NOT use your own external knowledge or hallucinate facts not present in the text.
    - If a specific piece of information (like stats) is not in the text, do NOT invent it.
    
    Return JSON with this exact structure:
    {{
        "theme": "modern_educational",
        "title": "Main Topic Title",
        "subtitle": "Brief context or tagline",
        "progressSteps": ["Concept 1", "Concept 2", "Concept 3"],
        "blocks": [
            {{
                "type": "hero",
                "title": "Main Concept Name",
                "content": "Short 1-2 sentence definition or key insight",
                "icon": "Lightbulb"
            }},
            {{
                "type": "split-stat",
                "stat1": {{"label": "Category A", "value": "40%", "description": "Brief context"}},
                "stat2": {{"label": "Category B", "value": "60%", "description": "Brief context"}}
            }},
            {{
                "type": "key-point",
                "title": "Important Point",
                "description": "2-3 sentence explanation of this key concept",
                "icon": "Target"
            }},
            {{
                "type": "key-point",
                "title": "Another Point",
                "description": "2-3 sentence explanation",
                "icon": "BookOpen"
            }},
            {{
                "type": "key-point",
                "title": "Third Point",
                "description": "2-3 sentence explanation",
                "icon": "Sparkles"
            }},
            {{
                "type": "comparison",
                "title": "Compare & Contrast",
                "left": {{"label": "Option A", "points": ["Point 1", "Point 2"]}},
                "right": {{"label": "Option B", "points": ["Point 1", "Point 2"]}}
            }},
            {{
                "type": "conclusion",
                "content": "Key takeaway or summary sentence",
                "icon": "CheckCircle"
            }}
        ],
        "stats": [
            {{"label": "Stat Label", "value": "Value"}}
        ],
        "key_points": [
            {{"title": "Point 1", "description": "Short description"}},
            {{"title": "Point 2", "description": "Short description"}},
            {{"title": "Point 3", "description": "Short description"}}
        ],
        "conclusion": "Short concluding sentence"
    }}

    IMPORTANT RULES:
    1. Always include a "hero" block first with the main concept
    2. Include 2-4 "key-point" blocks for important concepts
    3. Include "split-stat" ONLY if numerical data exists in text, otherwise omit
    4. Include "comparison" ONLY if there are contrasting concepts, otherwise omit
    5. Always end with a "conclusion" block
    6. Icons must be one of: Lightbulb, Target, BookOpen, Sparkles, CheckCircle, Brain, Zap, Award, TrendingUp, Users
    7. progressSteps should show the logical flow of concepts (3-5 steps)
    8. Also include legacy "stats" and "key_points" arrays for backward compatibility
    9. Keep all text concise, student-friendly, and educational

    Text to analyze:
    ---
    {text_content}
    ---
    
    Return ONLY the JSON object, no additional text.
    """

    try:
        response = model.generate_content(prompt)
        raw_response = response.text or ''
        cleaned_response = clean_json_response(raw_response)
        
        try:
            data = json.loads(cleaned_response)
            # Ensure required fields exist for backward compatibility
            if "title" not in data:
                data["title"] = "Infographic"
            if "subtitle" not in data:
                data["subtitle"] = "Generated Summary"
            if "blocks" not in data:
                data["blocks"] = []
            if "stats" not in data:
                data["stats"] = []
            if "key_points" not in data:
                data["key_points"] = []
            if "progressSteps" not in data:
                data["progressSteps"] = []
            return data
        except json.JSONDecodeError:
            return {
                "theme": "modern_educational",
                "title": "Infographic Generation Failed",
                "subtitle": "Could not parse data",
                "blocks": [
                    {"type": "hero", "title": "Error", "content": "Please try again", "icon": "Lightbulb"}
                ],
                "stats": [],
                "key_points": [{"title": "Error", "description": "Please try again."}],
                "progressSteps": [],
                "conclusion": ""
            }
    except Exception as e:
        print(f"Error generating infographic data: {e}")
        return {
            "theme": "modern_educational",
            "title": "Error",
            "subtitle": "System error",
            "blocks": [],
            "stats": [],
            "key_points": [],
            "progressSteps": [],
            "conclusion": str(e)
        }


def generate_flashcards_from_text(text_content):
    """Generate structured flashcard data from text content"""
    model = genai.GenerativeModel('gemini-2.5-flash')

    prompt = f"""
    You are an educational assistant creating flashcards for students.
    Analyze the following text and generate flashcards in a clean JSON format.

    Structure the JSON EXACTLY like this:
    {{
        "flashcards": [
            {{
                "term": "Important concept",
                "definition": "Short, simple explanation in 1–2 sentences."
            }},
            {{
                "term": "Another key idea",
                "definition": "Clear and concise explanation."
            }}
        ]
    }}

    Requirements:
    - Generate 5–10 flashcards depending on the density of the input text.
    - ONLY use information present in the provided text.
    - Definitions must be short, simple, and student-friendly.
    - Return ONLY the JSON. No markdown, no extra text.

    Text to analyze:
    ---
    {text_content}
    ---
    """

    try:
        response = model.generate_content(prompt)
        raw_response = response.text or ""
        cleaned_response = clean_json_response(raw_response)

        try:
            parsed_data = json.loads(cleaned_response)

            # Ensure format
            if "flashcards" not in parsed_data:
                parsed_data = {"flashcards": []}

            return parsed_data

        except json.JSONDecodeError:
            return {
                "flashcards": [
                    {
                        "term": "Flashcard generation error",
                        "definition": "The system could not parse the flashcard data. Please try again."
                    }
                ]
            }

    except Exception as e:
        print(f"Error generating flashcards: {e}")
        return {
            "flashcards": [
                {
                    "term": "System Error",
                    "definition": "An unexpected error occurred. Try again later."
                }
            ]
        }
