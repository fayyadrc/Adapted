from flask import Blueprint, request, jsonify
from .. import supabase

folders_bp = Blueprint('folders', __name__)

@folders_bp.route('/folders', methods=['POST'])
def create_folder():
    try:
        data = request.get_json()
        name = data.get('name')
        color = data.get('color', 'bg-blue-50 text-blue-600')
        user_id = data.get('user_id') # In a real app, get this from auth token

        if not name:
            return jsonify({"error": "Folder name is required"}), 400
        
        if not user_id:
             return jsonify({"error": "User ID is required"}), 400

        # Insert into Supabase
        response = supabase.table("folders").insert({
            "name": name,
            "color": color,
            "user_id": user_id
        }).execute()

        if not response.data:
            raise Exception("Failed to create folder")

        return jsonify(response.data[0]), 201

    except Exception as e:
        print(f"Error creating folder: {e}")
        return jsonify({"error": str(e)}), 500

@folders_bp.route('/folders', methods=['GET'])
def get_folders():
    try:
        user_id = request.args.get('user_id')
        
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        response = supabase.table("folders").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        
        return jsonify(response.data), 200

    except Exception as e:
        print(f"Error fetching folders: {e}")
        return jsonify({"error": str(e)}), 500

@folders_bp.route('/folders/<folder_id>', methods=['DELETE'])
def delete_folder(folder_id):
    try:
        # Check if folder has items? Or rely on cascade/set null?
        # For now, just delete
        response = supabase.table("folders").delete().eq("id", folder_id).execute()
        
        if not response.data:
             return jsonify({"error": "Folder not found or could not be deleted"}), 404

        return jsonify({"message": "Folder deleted successfully"}), 200

    except Exception as e:
        print(f"Error deleting folder: {e}")
        return jsonify({"error": str(e)}), 500
