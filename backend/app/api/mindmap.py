import json
from flask import Blueprint, request, jsonify
from ..utils.text_extractor import extract_text_from_pdf, extract_text_from_docx
from ..services.ai_service import generate_mindmap_from_text

# Create a Blueprint for mindmap-related routes
mindmap_bp = Blueprint('mindmap', __name__)

@mindmap_bp.route('/')
def home():
    """Home route for the API"""
    return "backend is working"

@mindmap_bp.route('/test')
def api_test():
    """Test route to verify the API is working"""
    return jsonify(message="Backend is working!")

@mindmap_bp.route('/upload', methods=['POST'])
def upload_and_generate():
    """
    Handles the file upload, text extraction, and mind map generation process.
    """
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
    else:
        return jsonify({"error": "Unsupported file type. Use PDF or DOCX."}), 415

    if not text_content or not text_content.strip():
        return jsonify({"error": "Could not extract text from the document."}), 500
        
    # Call our AI service with the extracted text
    mindmap_json_string = generate_mindmap_from_text(text_content)

    # Validate that the AI returned a valid JSON before sending it to the frontend
    try:
        mindmap_data = json.loads(mindmap_json_string)
        return jsonify(mindmap_data), 200
    except json.JSONDecodeError:
        return jsonify({
            "error": "The AI service returned a response in an invalid format.",
            "raw_response": mindmap_json_string # Send back what we got for debugging
        }), 500
