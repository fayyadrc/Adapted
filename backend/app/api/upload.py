import json
import uuid
import traceback
from flask import Blueprint, request, jsonify
from ..utils.text_extractor import extract_text_from_pdf, extract_text_from_docx
from ..services.ai_service import generate_mindmap_from_text, generate_summary_from_text, generate_quiz_from_text

upload_bp = Blueprint('upload', __name__)

# --- In-memory data store (for demonstration purposes) ---
# In a production environment, you would use a database (e.g., Redis, PostgreSQL)
results_store = {}

@upload_bp.route('/upload', methods=['POST'])
def upload_and_process():
    """
    Unified upload endpoint that processes files and generates requested formats
    """
    print("=== UPLOAD ENDPOINT CALLED ===")
    
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # Get the title and requested formats from the form data
    title = request.form.get('title', file.filename)
    formats = request.form.get('formats', '["visual", "audio", "quiz"]')
    
    print(f"Title: {title}")
    print(f"Formats string: {formats}")
    
    try:
        requested_formats = json.loads(formats)
        print(f"Requested formats parsed: {requested_formats}")
    except json.JSONDecodeError:
        requested_formats = ["visual", "audio", "quiz"]
        print(f"JSON decode error, using defaults: {requested_formats}")

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
        print("=== Generating VISUAL format ===")
        try:
            mindmap_json_string = generate_mindmap_from_text(text_content)
            print(f"Mind map JSON string: {mindmap_json_string[:200]}...")
            mindmap_data = json.loads(mindmap_json_string)
            print(f"Mind map data parsed successfully")
            results["formats"]["visual"] = {
                "type": "Mind Map",
                "description": "Interactive mind map showing key concepts and relationships",
                "data": mindmap_data,
                "icon": "🗺️"
            }
            print(f"Visual format added to results")
        except Exception as e:
            print(f"Error generating mind map: {e}")
            traceback.print_exc()
            results["formats"]["visual"] = {
                "type": "Mind Map",
                "description": "Error generating mind map",
                "error": str(e),
                "icon": "🗺️"
            }
    else:
        print(f"Visual NOT in requested formats: {requested_formats}")

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
        print("=== Generating QUIZ format ===")
        try:
            # Get number of questions from request, default to 5
            num_questions = request.form.get('num_questions', 5)
            try:
                num_questions = int(num_questions)
            except (ValueError, TypeError):
                num_questions = 5
            
            quiz_data = generate_quiz_from_text(text_content, num_questions)
            print(f"Quiz data generated: {json.dumps(quiz_data, indent=2)[:200]}...")
            results["formats"]["quiz"] = {
                "type": "Interactive Quiz",
                "description": "Test your understanding with AI-generated questions",
                "data": quiz_data,
                "questionCount": len(quiz_data.get('questions', [])),
                "icon": "❓"
            }
            print(f"Quiz format added to results")
        except Exception as e:
            print(f"Error generating quiz: {e}")
            traceback.print_exc()
            results["formats"]["quiz"] = {
                "type": "Interactive Quiz",
                "description": "Error generating quiz",
                "error": str(e),
                "icon": "❓"
            }

    # --- Store the results in our in-memory store ---
    results_store[results["id"]] = results

    print(f"=== FINAL RESULTS ===")
    print(f"Results ID: {results['id']}")
    print(f"Results formats keys: {list(results['formats'].keys())}")
    print(f"Results: {json.dumps(results, indent=2)[:500]}...")

    return jsonify(results), 200


@upload_bp.route('/results/<result_id>')
def get_results(result_id):
    """
    Get results by ID from the in-memory store.
    """
    result = results_store.get(result_id)
    
    if result is None:
        return jsonify({"error": "Result not found"}), 404

    return jsonify(result), 200