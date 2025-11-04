from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
import google.generativeai as genai
from docx import Document
import fitz  # PyMuPDF
import logging
from dotenv import load_dotenv
import json

load_dotenv()
logging.basicConfig(level=logging.INFO)

quiz_bp = Blueprint('quiz', __name__)

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

def extract_text_from_docx(file_path):
    doc = Document(file_path)
    return "\n".join([p.text for p in doc.paragraphs])

def extract_text_from_pdf(file_path):
    text = ""
    with fitz.open(file_path) as pdf:
        for page in pdf:
            text += page.get_text()
    return text

@quiz_bp.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    """
    Generate quiz questions from either uploaded file (PDF/DOCX) or text input.
    """
    try:
        quiz_type = request.form.get('quiz_type', 'mcq')
        num_questions = int(request.form.get('num_questions', 5))
        content = request.form.get('content')
        extracted_text = ""

        if 'file' in request.files:
            file = request.files['file']
            if file.filename:
                filename = secure_filename(file.filename)
                file_path = os.path.join('temp', filename)
                os.makedirs('temp', exist_ok=True)
                
                file.save(file_path)

                if filename.endswith('.pdf'):
                    extracted_text = extract_text_from_pdf(file_path)
                elif filename.endswith('.docx'):
                    extracted_text = extract_text_from_docx(file_path)
                else:
                    return jsonify({"error": "Only .pdf and .docx files are supported."}), 400

                os.remove(file_path)
        else:
            extracted_text = content or ""

        if not extracted_text.strip():
            return jsonify({"error": "No content provided."}), 400

        # Prompt for Groq
        prompt = f"""
You are an AI quiz generator.
Based on the following content, create {num_questions} {quiz_type} questions.

Return the output strictly as JSON with the structure:
{{
  "quiz_type": "{quiz_type}",
  "questions": [
    {{
      "question": "string",
      "options": ["A", "B", "C", "D"],  # only for MCQs
      "answer": "string"
    }}
  ]
}}

Content:
{extracted_text}
"""

        response = model.generate_content(prompt)
        
        # Extract the JSON from the response
        # Look for JSON content within the response
        try:
            # First try to parse the entire response
            result = json.loads(response.text)
        except json.JSONDecodeError:
            # If that fails, try to find JSON content within markdown code blocks
            import re
            json_match = re.search(r'```json\s*(.*?)\s*```', response.text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group(1))
            else:
                # If no JSON found in code blocks, look for any JSON-like content
                json_match = re.search(r'({[\s\S]*})', response.text)
                if json_match:
                    result = json.loads(json_match.group(1))
                else:
                    raise ValueError("Could not parse JSON from response")

        return jsonify({"result": result})

    except Exception as e:
        logging.error(f"Error generating quiz: {str(e)}")
        return jsonify({"error": str(e)}), 500