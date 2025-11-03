import json
import uuid
from flask import Blueprint, request, jsonify
from ..utils.text_extractor import extract_text_from_pdf, extract_text_from_docx
from ..services.ai_service import generate_mindmap_from_text, generate_summary_from_text, generate_quiz_from_text

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/upload', methods=['POST'])
def upload_and_process():
    """
    Unified upload endpoint that processes files and generates requested formats
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # Get the title and requested formats from the form data
    title = request.form.get('title', file.filename)
    formats = request.form.get('formats', '["visual", "audio", "quiz"]')
    
    try:
        requested_formats = json.loads(formats)
    except json.JSONDecodeError:
        requested_formats = ["visual", "audio", "quiz"]

    # Extract text from the uploaded file
    text_content = ""
    filename = file.filename.lower()
    
    if filename.endswith('.pdf'):
        text_content = extract_text_from_pdf(file.stream.read())
    elif filename.endswith('.docx'):
        text_content = extract_text_from_docx(file)
    else:
        return jsonify({"error": "This file type isn't supported yet. For best results, please convert your file to a PDF or DOCX before uploading."}), 415

    if not text_content or not text_content.strip():
        return jsonify({"error": "Could not extract text from the document. Please ensure your file contains readable text."}), 500

    # Generate the requested formats
    results = {
        "id": str(uuid.uuid4()),
        "title": title,
        "status": "completed",
        "formats": {}
    }

    # Generate visual format (mind map)
    if "visual" in requested_formats:
        try:
            mindmap_json_string = generate_mindmap_from_text(text_content)
            mindmap_data = json.loads(mindmap_json_string)
            results["formats"]["visual"] = {
                "type": "Mind Map",
                "description": "Interactive mind map showing key concepts and relationships",
                "data": mindmap_data,
                "icon": "🗺️"
            }
        except Exception as e:
            print(f"Error generating mind map: {e}")
            results["formats"]["visual"] = {
                "type": "Mind Map",
                "description": "Error generating mind map",
                "error": str(e),
                "icon": "🗺️"
            }

    # Generate audio format (summary for TTS)
    if "audio" in requested_formats:
        try:
            summary_data = generate_summary_from_text(text_content)
            # Create audio-friendly text
            audio_text = f"{summary_data.get('title', 'Summary')}. {summary_data.get('summary', '')} "
            audio_text += "Key points include: " + ". ".join(summary_data.get('key_points', []))
            
            results["formats"]["audio"] = {
                "type": "Audio Summary",
                "description": "Professional narration of your content",
                "data": {
                    "text": audio_text,
                    "summary": summary_data
                },
                "duration": f"{len(audio_text.split()) * 0.5:.0f}:00",  # Rough estimate
                "icon": "🎙️"
            }
        except Exception as e:
            print(f"Error generating audio content: {e}")
            results["formats"]["audio"] = {
                "type": "Audio Summary", 
                "description": "Error generating audio content",
                "error": str(e),
                "icon": "🎙️"
            }

    # Generate quiz format
    if "quiz" in requested_formats:
        try:
            quiz_data = generate_quiz_from_text(text_content)
            results["formats"]["quiz"] = {
                "type": "Interactive Quiz",
                "description": "Test your understanding with AI-generated questions",
                "data": quiz_data,
                "questionCount": len(quiz_data.get('questions', [])),
                "icon": "❓"
            }
        except Exception as e:
            print(f"Error generating quiz: {e}")
            results["formats"]["quiz"] = {
                "type": "Interactive Quiz",
                "description": "Error generating quiz",
                "error": str(e),
                "icon": "❓"
            }

    return jsonify(results), 200


@upload_bp.route('/results/<result_id>')
def get_results(result_id):
    """
    Get results by ID (for now, return mock data as we're not storing in DB)
    In production, you'd fetch this from your database
    """
    # Mock data for demonstration
    mock_result = {
        "id": result_id,
        "title": "Biology Chapter 3 - Photosynthesis",
        "uploadDate": "2024-11-01",
        "status": "completed",
        "formats": {
            "visual": {
                "type": "Mind Map",
                "description": "Interactive mind map showing the photosynthesis process",
                "content": "Light Reactions → Calvin Cycle → Glucose Production",
                "icon": "🗺️"
            },
            "audio": {
                "type": "Podcast Narration", 
                "description": "Professional narration of your content",
                "duration": "8:45",
                "icon": "🎙️"
            },
            "quiz": {
                "type": "Interactive Quiz",
                "description": "Test your understanding with AI-generated questions",
                "questionCount": 12,
                "icon": "❓"
            }
        }
    }
    
    return jsonify(mock_result), 200