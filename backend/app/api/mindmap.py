import json
from flask import Blueprint, request, jsonify
from ..utils.text_extractor import extract_text_from_pdf, extract_text_from_docx
from ..services.ai_service import generate_mindmap_from_text


mindmap_bp = Blueprint('mindmap', __name__)

@mindmap_bp.route('/')
def home():
    return "backend is working"

@mindmap_bp.route('/test')
def api_test():
    return jsonify(message="Backend is working!")

# OLD ROUTE - REMOVED to avoid conflict with unified /api/upload endpoint
# The unified upload endpoint in upload.py now handles mindmap generation
# @mindmap_bp.route('/upload', methods=['POST'])
# def upload_and_generate():
#     ...

# If you need a direct mindmap-only endpoint, use /api/mindmap/generate
@mindmap_bp.route('/mindmap/generate', methods=['POST'])
def generate_mindmap_only():
    """Direct mindmap generation endpoint (legacy support)"""
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
        
    #calls ai service with the extracted text
    mindmap_json_string = generate_mindmap_from_text(text_content)

    #makes sure data returned is json for the frontend to render it
    try:
        mindmap_data = json.loads(mindmap_json_string)
        return jsonify(mindmap_data), 200
    except json.JSONDecodeError:
        return jsonify({
            "error": "The AI service returned a response in an invalid format.",
            "raw_response": mindmap_json_string 
        }), 500
