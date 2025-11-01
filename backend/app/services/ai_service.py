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
                    "summary": "optional detailed summary string (e.g., key points from the text).",
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
    """Generate a student-friendly summary from text content"""
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    You are an educational assistant helping high school students. Create a clear, engaging summary of the following text.

    Format your response as a JSON object with this exact structure:
    {{
        "title": "Brief title for the content",
        "summary": "2-3 sentence overview in simple language",
        "key_points": [
            "Key point 1",
            "Key point 2", 
            "Key point 3",
            "Key point 4"
        ],
        "example": "A simple, relatable example or analogy to help understand the main concept"
    }}

    Keep the language simple and engaging for high school students. Avoid jargon and focus on the most important concepts.

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
                "example": "Technical error occurred"
            }
    except Exception as e:
        print(f"Error generating summary: {e}")
        return {
            "error": f"Failed to generate summary: {str(e)}",
            "title": "Error",
            "summary": "Unable to process your document.",
            "key_points": ["Please try again"],
            "example": "System error"
        }


def generate_quiz_from_text(text_content):
    """Generate an interactive quiz from text content"""
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    You are an educational assistant creating a quiz for high school students. Generate an engaging quiz based on the following text.

    Format your response as a JSON object with this exact structure:
    {{
        "title": "Quiz title based on the content",
        "description": "Brief description of what this quiz covers",
        "questions": [
            {{
                "question": "Question text here",
                "type": "multiple_choice",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": 0,
                "explanation": "Brief explanation of why this is correct"
            }},
            {{
                "question": "Another question",
                "type": "true_false", 
                "options": ["True", "False"],
                "correct_answer": 1,
                "explanation": "Explanation for the answer"
            }}
        ]
    }}

    Create 8-10 questions total. Mix multiple choice and true/false questions. Make sure questions test understanding, not just memorization. Keep language clear and appropriate for high school level.

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
            return parsed_data
        except json.JSONDecodeError:
            return {
                "error": "Failed to parse AI response",
                "title": "Quiz Generation Error",
                "description": "Unable to generate quiz at this time.",
                "questions": [
                    {
                        "question": "Please try uploading your document again.",
                        "type": "multiple_choice",
                        "options": ["Try again", "Upload different file", "Contact support", "Check file format"],
                        "correct_answer": 0,
                        "explanation": "Technical error occurred during quiz generation."
                    }
                ]
            }
    except Exception as e:
        print(f"Error generating quiz: {e}")
        return {
            "error": f"Failed to generate quiz: {str(e)}",
            "title": "Error",
            "description": "Unable to process your document for quiz creation.",
            "questions": [
                {
                    "question": "What should you do when encountering this error?",
                    "type": "multiple_choice", 
                    "options": ["Try again", "Contact support", "Check internet", "All of the above"],
                    "correct_answer": 3,
                    "explanation": "System errors can usually be resolved by trying again or contacting support."
                }
            ]
        }

