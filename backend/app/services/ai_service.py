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

