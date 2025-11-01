import json
from flask import Blueprint, request, jsonify
from ..utils.text_extractor import extract_text_from_pdf, extract_text_from_docx
from ..services.ai_service import generate_summary_from_text, generate_quiz_from_text

summary_bp = Blueprint('summary', __name__)

@summary_bp.route('/generate-summary', methods=['POST'])
def generate_summary():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    text_content = ""
    filename = file.filename.lower()
    
    if filename.endswith('.pdf'):
        text_content = extract_text_from_pdf(file.stream.read())
    elif filename.endswith('.docx'):
        text_content = extract_text_from_docx(file)
    elif filename.endswith('.txt'):
        text_content = file.read().decode('utf-8')
    else:
        return jsonify({"error": "Unsupported file type. Use PDF, DOCX, or TXT."}), 415

    if not text_content or not text_content.strip():
        return jsonify({"error": "Could not extract text from the document."}), 500
        
    try:
        summary_data = generate_summary_from_text(text_content)
        return jsonify(summary_data), 200
    except Exception as e:
        return jsonify({"error": f"Failed to generate summary: {str(e)}"}), 500

@summary_bp.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    text_content = ""
    filename = file.filename.lower()
    
    if filename.endswith('.pdf'):
        text_content = extract_text_from_pdf(file.stream.read())
    elif filename.endswith('.docx'):
        text_content = extract_text_from_docx(file)
    elif filename.endswith('.txt'):
        text_content = file.read().decode('utf-8')
    else:
        return jsonify({"error": "Unsupported file type. Use PDF, DOCX, or TXT."}), 415

    if not text_content or not text_content.strip():
        return jsonify({"error": "Could not extract text from the document."}), 500
        
    try:
        quiz_data = generate_quiz_from_text(text_content)
        return jsonify(quiz_data), 200
    except Exception as e:
        return jsonify({"error": f"Failed to generate quiz: {str(e)}"}), 500