import json
import uuid
import traceback
from flask import Blueprint, request, jsonify
from ..utils.text_extractor import extract_text_from_pdf, extract_text_from_docx
from ..services.ai_service import generate_mindmap_from_text, generate_summary_from_text, generate_quiz_from_text
from .. import supabase

upload_bp = Blueprint('upload', __name__)

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
    results_content = {
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
            results_content["formats"]["visual"] = {
                "type": "Mind Map",
                "description": "Interactive mind map showing key concepts and relationships",
                "data": mindmap_data,
                "icon": "🗺️"
            }
            print(f"Visual format added to results")
        except Exception as e:
            print(f"Error generating mind map: {e}")
            traceback.print_exc()
            results_content["formats"]["visual"] = {
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
            
            results_content["formats"]["audio"] = {
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
            results_content["formats"]["audio"] = {
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
            results_content["formats"]["quiz"] = {
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
            results_content["formats"]["quiz"] = {
                "type": "Interactive Quiz",
                "description": "Error generating quiz",
                "error": str(e),
                "icon": "❓"
            }

    # Generate reports/summary format
    if "reports" in requested_formats:
        print("=== Generating REPORTS/SUMMARY format ===")
        try:
            summary_data = generate_summary_from_text(text_content)
            print(f"Summary data generated successfully")
            results_content["formats"]["reports"] = {
                "type": "Summary Report",
                "description": "Comprehensive summary with key points and examples",
                "data": summary_data,
                "icon": "📄"
            }
            print(f"Reports format added to results")
        except Exception as e:
            print(f"Error generating summary: {e}")
            traceback.print_exc()
            results_content["formats"]["reports"] = {
                "type": "Summary Report",
                "description": "Error generating summary",
                "error": str(e),
                "icon": "📄"
            }

    # Get folder_id if present
    folder_id = request.form.get('folder_id')
    if folder_id == 'null' or folder_id == 'undefined':
        folder_id = None

    # Get user_id from request
    user_id = request.form.get('user_id')
    if user_id == 'null' or user_id == 'undefined':
        user_id = None

    # --- Store the results in Supabase ---
    try:
        data_to_insert = {
            "title": title,
            "content": results_content,
            "folder_id": folder_id,
            "user_id": user_id
        }
        
        print(f"Inserting into Supabase with folder_id: {folder_id}...")
        response = supabase.table("results").insert(data_to_insert).execute()
    
        if not response.data:
             raise Exception("No data returned from Supabase insert")
             
        inserted_record = response.data[0]
        result_id = inserted_record['id']
        
        # Construct the response object expected by frontend
        # The frontend expects the full object including 'id' and 'formats' at top level?
        # Looking at previous code:
        # results = { "id": ..., "title": ..., "formats": ... }
        # So we should reconstruct that structure
        
        final_result = {
            "id": result_id,
            "title": inserted_record['title'],
            "status": "completed",
            "formats": inserted_record['content']['formats'],
            "created_at": inserted_record['created_at']
        }

        print(f"=== FINAL RESULTS ===")
        print(f"Results ID: {final_result['id']}")
        
        return jsonify(final_result), 200

    except Exception as e:
        print(f"Error saving to Supabase: {e}")
        traceback.print_exc()
        return jsonify({"error": f"Failed to save results: {str(e)}"}), 500


@upload_bp.route('/results/<result_id>')
def get_results(result_id):
    """
    Get results by ID from Supabase.
    """
    try:
        response = supabase.table("results").select("*").eq("id", result_id).execute()
        
        if not response.data:
            return jsonify({"error": "Result not found"}), 404
            
        record = response.data[0]
        
        # Reconstruct the response format
        result = {
            "id": record['id'],
            "title": record['title'],
            "status": "completed", # Assuming completed if it's in DB
            "formats": record['content']['formats'],
            "created_at": record['created_at']
        }
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error fetching from Supabase: {e}")
        return jsonify({"error": f"Failed to fetch result: {str(e)}"}), 500


@upload_bp.route('/results', methods=['GET'])
def list_results():
    """
    List all results from Supabase, filtered by user_id if provided.
    """
    try:
        user_id = request.args.get('user_id')
        
        # Select specific fields to reduce payload size
        query = supabase.table("results").select("id, title, created_at, content, folder_id, user_id")
        
        # Filter by user_id if provided
        if user_id:
            query = query.eq("user_id", user_id)
        
        response = query.order("created_at", desc=True).execute()
        
        if not response.data:
            return jsonify([]), 200
            
        results = []
        for record in response.data:
            results.append({
                "id": record['id'],
                "title": record['title'],
                "created_at": record['created_at'],
                "formats": record['content'].get('formats', {}) if record['content'] else {},
                "folder_id": record.get('folder_id'),
                "user_id": record.get('user_id')
            })
            
        return jsonify(results), 200
        
    except Exception as e:
        print(f"Error fetching results list: {e}")
        return jsonify({"error": f"Failed to fetch results list: {str(e)}"}), 500

@upload_bp.route('/results/<result_id>', methods=['DELETE'])
def delete_result(result_id):
    """
    Delete a result by ID from Supabase.
    """
    try:
        response = supabase.table("results").delete().eq("id", result_id).execute()
        
        # Supabase delete returns the deleted record(s) in data
        if not response.data:
             return jsonify({"error": "Result not found or could not be deleted"}), 404
             
        return jsonify({"message": "Result deleted successfully"}), 200
        
    except Exception as e:
        print(f"Error deleting result: {e}")
        return jsonify({"error": f"Failed to delete result: {str(e)}"}), 500

@upload_bp.route('/lessons/<lesson_id>/move', methods=['PATCH'])
def move_lesson_to_folder(lesson_id):
    """
    Move a lesson (result) to a folder by updating its folder_id.
    """
    try:
        data = request.get_json()
        folder_id = data.get('folder_id')
        
        # folder_id can be None to remove from folder
        response = supabase.table("results").update({
            "folder_id": folder_id
        }).eq("id", lesson_id).execute()
        
        if not response.data:
            return jsonify({"error": "Lesson not found or could not be updated"}), 404
            
        return jsonify(response.data[0]), 200
        
    except Exception as e:
        print(f"Error moving lesson to folder: {e}")
        return jsonify({"error": f"Failed to move lesson: {str(e)}"}), 500