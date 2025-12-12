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
        print(f"=== DELETE FOLDER START ===")
        print(f"Attempting to delete folder: {folder_id}")
        
        # First, verify the folder exists
        check_response = supabase.table("folders").select("*").eq("id", folder_id).execute()
        print(f"Folder check response: {check_response.data}")
        
        if not check_response.data:
            print(f"Folder {folder_id} not found")
            return jsonify({"error": "Folder not found"}), 404
        
        # First, move any documents in this folder to no folder (set folder_id to null)
        try:
            update_response = supabase.table("results").update({"folder_id": None}).eq("folder_id", folder_id).execute()
            print(f"Moved documents out of folder {folder_id}: {update_response.data}")
        except Exception as move_error:
            print(f"Warning: Could not move documents: {move_error}")
        
        # Now delete the folder
        print(f"Executing delete on folder {folder_id}...")
        response = supabase.table("folders").delete().eq("id", folder_id).execute()
        print(f"Delete response data: {response.data}")
        
        # Verify the folder was actually deleted
        verify_response = supabase.table("folders").select("id").eq("id", folder_id).execute()
        if verify_response.data:
            print(f"ERROR: Folder still exists after delete!")
            return jsonify({"error": "Failed to delete folder - it still exists"}), 500
        
        print(f"=== DELETE FOLDER SUCCESS ===")
        return jsonify({"message": "Folder deleted successfully", "id": folder_id}), 200

    except Exception as e:
        print(f"Error deleting folder: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
