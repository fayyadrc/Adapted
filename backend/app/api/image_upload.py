from flask import Blueprint, request, jsonify, current_app
from supabase import create_client
import uuid
import os

image_upload_bp = Blueprint('image_upload', __name__)

def get_supabase_client():
    # Use the global client if available, or create a new one
    # In this app structure, we might need to access it from app config or create a new one
    url = current_app.config.get('SUPABASE_URL')
    key = current_app.config.get('SUPABASE_KEY')
    if not url or not key:
        return None
    return create_client(url, key)

@image_upload_bp.route('/upload-image', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        supabase = get_supabase_client()
        if not supabase:
            return jsonify({"error": "Supabase not configured"}), 500

        # Generate a unique filename
        filename = f"{uuid.uuid4()}.png"
        bucket_name = "generated-content"
        
        # Read file content
        file_content = file.read()

        # Upload to Supabase
        # Note: 'file_options' might be needed depending on supabase-py version, 
        # but usually upload takes path and file body.
        # For supabase-py storage:
        res = supabase.storage.from_(bucket_name).upload(
            path=filename,
            file=file_content,
            file_options={"content-type": "image/png"}
        )

        # Get public URL
        public_url = supabase.storage.from_(bucket_name).get_public_url(filename)

        return jsonify({
            "message": "Image uploaded successfully",
            "url": public_url,
            "filename": filename
        }), 200

    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({"error": str(e)}), 500
